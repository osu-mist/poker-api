const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const _ = require('lodash');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const config = require('config');

const { createConnStub } = require('./test-util');
const {
  fakeId,
  fakeMemberPostBody,
  fakeEmail,
  fakeName,
  fakeMemberPatchBody,
  testCases,
  databaseNameTestData,
  truthyList,
  falseyList,
  nonDuplicateArray,
  duplicateArray,
} = require('./test-data');

const membersSerializer = appRoot.require('api/v1/serializers/members-serializer');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);
const { assert } = chai;

describe('Test members-dao', () => {
  let membersDao;

  beforeEach(() => sinon.stub(config, 'get').returns({ oracledb: {} }));

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
        const serializeMembersStub = sinon.stub(membersSerializer, 'serializeMembers');
        serializeMembersStub.returnsArg(0);

        membersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/member-dao`,
          {
            [`${appRoot}/api/v1/serializers/members-serializer`]: { serializeMembers: serializeMembersStub },
          });

        const expectedResult = testCase.data.rows;
        const result = membersDao.getMembers();
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult)
          .then(() => {
            sinon.assert.calledOnce(serializeMembersStub);
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
        const serializeMembersStub = sinon.stub(membersSerializer, 'serializeMember');
        serializeMembersStub.returnsArg(0);

        membersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/member-dao`,
          {
            [`${appRoot}/api/v1/serializers/members-serializer`]: { serializeMembers: serializeMembersStub },
          });
        const [expectedResult] = testCase.data.rows;
        const result = membersDao.getMemberById(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult)
          .then(() => {
            sinon.assert.callCount(serializeMembersStub, expectedResult ? 1 : 0);
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
          sinon.assert.notCalled(connStub.executeStub);
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
      const validResult = membersDao.hasDuplicateMemberId(nonDuplicateArray);
      assert.strictEqual(validResult, false);
    });

    it('Return true when dup array', () => {
      const emptyResult = membersDao.hasDuplicateMemberId(duplicateArray);
      assert.strictEqual(emptyResult, true);
    });
  });

  describe('Test isMemberAlreadyRegistered', () => {
    it('The function should be rejected when the database response does not contain COUNT(1) field', () => {
      const testCase = testCases.emptyResult;

      createConnStub(testCase);
      const result = membersDao.isMemberAlreadyRegistered(fakeName, fakeEmail);
      return result.should.eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });
  });

  describe('Test databaseName', () => {
    it('Should return expected name for database schema', () => {
      _.forEach(databaseNameTestData, (item) => {
        assert.strictEqual(membersDao.databaseName(item.param), item.result);
      });
    });
  });

  describe('Test isTruthyOrZero', () => {
    it('Return false for Falsey values (exluding 0)', () => {
      _.forEach(falseyList, (item) => {
        assert.strictEqual(membersDao.isTruthyOrZero(item), false);
      });
    });

    it('Return Truthy value for truthy values and 0', () => {
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
        .and.deep.equal(expectedResult);
    });

    it('Should be rejected when there are no OutId in the result field', () => {
      createConnStub(testCases.singleResult);

      const result = membersDao.postMember(fakeMemberPostBody);
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });
  });

  describe('Test deleteMember', () => {
    const validTestCases = [
      testCases.singleResult,
      testCases.emptyResult,
    ];
    _.forEach(validTestCases, (testCase) => {
      it(`deleteMember should be fulfilled with ${testCase.description}`, () => {
        createConnStub(testCase);

        const expectedResult = testCase.data;
        const result = membersDao.deleteMember(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test patchMember', () => {
    const validFalseTestCases = [
      testCases.singleResult,
      testCases.emptyResult,
      testCases.rowEffectZeroResult,
    ];

    it('Empty body should be fulfilled while the execute function from conn object is not called at all', () => {
      const connStub = createConnStub();

      const result = membersDao.patchMember(fakeId, {});
      return result.should
        .eventually.be.fulfilled
        .and.equal(true)
        .then(() => {
          sinon.assert.notCalled(connStub.executeStub);
        });
    });

    _.forEach(validFalseTestCases, (testCase) => {
      it(`patchMember should be fulfilled with ${testCase.description} and return false`, () => {
        createConnStub(testCase);

        const expectedResult = false;
        const result = membersDao.patchMember(fakeId, fakeMemberPatchBody);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });

    it('patchMember should be fulfilled with one row effected result and return true', () => {
      createConnStub(testCases.rowEffectedOneResult);

      const expectedResult = true;
      const result = membersDao.patchMember(fakeId, fakeMemberPatchBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult);
    });
  });
});
