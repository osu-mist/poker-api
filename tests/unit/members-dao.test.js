const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const membersSerializer = appRoot.require('api/v1/serializers/members-serializer');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

describe('Test members-dao', () => {
  const fakeId = 'fakeId';
  let membersDao;

  const standardConnStub = () => {
    sinon.stub(conn, 'getConnection').resolves({
      execute: (sql, sqlParams) => {
        const sqlResults = {
          multiResults: {
            rows: [{}, {}],
            outBinds: {
              outId: [1],
            },
          },
          singleResult: {
            rows: [{}],
            outBinds: {
              outId: [1],
            },
          },
          emptyResult: { rows: [] },
        };
        let result;
        if (sql.includes('DELETE')) {
          result = sqlResults.emptyResult;
        } else if ('memberId' in sqlParams) {
          result = sqlResults.singleResult;
        } else {
          result = sqlResults.multiResults;
        }
        return result;
      },
      close: () => null,
    });
  };
  afterEach(() => sinon.restore());

  describe('Test getMembers', () =>{
    it('getMembers should be fulfilled with multiResult', () => {
      standardConnStub();
      const membersSerializerStub = sinon.stub(membersSerializer, 'serializeMembers');
      membersSerializerStub.returnsArg(0);

      membersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/member-dao`,
        {[`${appRoot}/api/v1/serializers/members-serializer`]: membersSerializerStub})

      const expectedResult = [{}, {}];
      const result = membersDao.getMembers();
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult)
        .then(() => {
          sinon.assert.callCount(membersSerializerStub, 1);
        });
    });
  });

  describe('Test getMembersById', () => {

  });
});
