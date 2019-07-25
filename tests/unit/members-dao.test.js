const appRoot = require('app-root-path');
const chai = require('chai');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const membersDao = appRoot.require('api/v1/db/oracledb/member-dao');
const membersSerializer = appRoot.require('api/v1/serializers/member-serializer');

chai.should();

describe('Test members-dao', () => {
  const fakeId = 'fakeId';

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
});

afterEach(() => sinon.restore());

it('getMembers should return multiResult', () => {
  standardConnStub();
  const membersSerializerStub = sinon.stub(membersSerializer, 'serializeMembers');
  membersSerializerStub.returnsArg(0);


});