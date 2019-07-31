const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { createConnStub } = require('./test-util');
const { fakeId, fakeMemberPostBody } = require('./test-data');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const membersSerializer = appRoot.require('api/v1/serializers/members-serializer');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);
const { assert } = chai;

describe('Test members-dao', () => {
  let membersDao;

  const testCases = {
    singleResult: {
      data: {
        rows: [{}],
      },
      description: 'single result',
    },
    singleResultWithOutId: {
      data: {
        rows: [{}],
        outBinds: {
          outId: [1],
        },
      },
      description: 'single result with OutId',
    },
    multiResult: {
      data: {
        rows: [{}, {}],
        outBinds: {
          outId: [1],
        },
      },
      description: 'multiple result',
    },
    emptyResult: {
      data: {
        rows: [],
      },
      description: 'empty result',
    },
  };

  afterEach(() => sinon.restore());

  describe('Test getMembers', () => {
    const validTestCases = [
      testCases.multiResult,
      testCases.singleResult,
      testCases.emptyResult,
    ];
    _.forEach(validTestCases, (testCase) => {
      it(`getMembers should be fulfilled with ${testCase.description}`, () => {
        createConnStub(testCase);
        const membersSerializerStub = sinon.stub(membersSerializer, 'serializeMembers');
        membersSerializerStub.returnsArg(0);

        membersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/member-dao`,
          { [`${appRoot}/api/v1/serializers/members-serializer`]: membersSerializerStub });

        const expectedResult = testCase.data.rows;
        const result = membersDao.getMembers();
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult)
          .then(() => {
            sinon.assert.callCount(membersSerializerStub, 1);
          });
      });
    });
  });

  describe('Test getMembersById', () => {
    const validTestCases = [
      testCases.singleResult,
      testCases.emptyResult,
    ];
    _.forEach(validTestCases, (testCase) => {
      it(`getMemberById should be fulfilled with ${testCase.description}`, () => {
        createConnStub(testCase);
        const membersSerializerStub = sinon.stub(membersSerializer, 'serializeMember');
        membersSerializerStub.returnsArg(0);

        membersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/member-dao`,
          { [`${appRoot}/api/v1/serializers/members-serializer`]: membersSerializerStub });
        const [expectedResult] = testCase.data.rows;
        const result = membersDao.getMemberById(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult)
          .then(() => {
            sinon.assert.callCount(membersSerializerStub, expectedResult ? 1 : 0);
          });
      });
    });
    // Now test multiple result as invalid case.
    it('getMemberId should be rejected when multiple values are returned', () => {
      const testCase = testCases.multiResult;
      const error = 'Expect a single object but got multiple results.';

      createConnStub(testCase);

      const result = membersDao.getMemberById(fakeId);
      return result.should.eventually.be.rejectedWith(Error, error);
    });
  });

  describe('Test validateMembers', () => {
    it('Connection Stub execute function would not be called if the memberId parameter passed is empty', () => {
      const connStub = createConnStub();

      const result = membersDao.validateMembers([]);
      return result.should.eventually.be.fulfilled
        .and.equal(true)
        .then(() => {
          sinon.assert.callCount(connStub.executeStub, 0);
        });
    });

    it('The function should be rejected when the database response does not contain COUNT(1) field', () => {
      const testCase = testCases.emptyResult;
      const error = 'Cannot read property \'COUNT(1)\' of undefined';

      createConnStub(testCase);
      const result = membersDao.validateMembers([fakeId]);
      return result.should.eventually.be.rejectedWith(TypeError, error);
    });
  });

  describe('Test hasDuplicateMemberId', () => {
    it('Return false when empty or valid no dup array', () => {
      const emptyResult = membersDao.hasDuplicateMemberId([]);
      assert.strictEqual(emptyResult, false);
      const validResult = membersDao.hasDuplicateMemberId([1, 4, 2, 3, 7, 6, 200]);
      assert.strictEqual(validResult, false);
    });

    it('Return true when dup array', () => {
      const emptyResult = membersDao.hasDuplicateMemberId([3, 5, 3, 2, 4, 6]);
      assert.strictEqual(emptyResult, true);
    });
  });

  describe('Test isTruthyOrZero', () => {
    it('Return false for Falsey values (exluding 0)', () => {
      const falseyList = [
        false,
        '',
        null,
        undefined,
        NaN,
      ];
      _.forEach(falseyList, (item) => {
        assert.strictEqual(membersDao.isTruthyOrZero(item), false);
      });
    });

    it('Return Truthy value for truthy values and 0', () => {
      const truthyList = [
        0,
        1,
        'a',
        'abc',
        '0',
        'false',
        [],
        [1, 2, 3],
        {
          a: 'b',
        },
        {},
        () => {},
      ];
      _.forEach(truthyList, (item) => {
        assert.isOk(membersDao.isTruthyOrZero(item));
      });
    });
  });

  describe('Test postMember', () => {
    it('Improper body should be rejected', () => {
      createConnStub();

      const result = membersDao.postMember({});
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('Should be fulfilled with single result', () => {
      const expectedResult = {};
      createConnStub(testCases.singleResultWithOutId);

      const result = membersDao.postMember(fakeMemberPostBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal({});
    });

    it('Should be rejected when there are no OutId in the result field', () => {
      createConnStub(testCases.singleResult);

      const result = membersDao.postMember(fakeMemberPostBody);
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });
  });
});
