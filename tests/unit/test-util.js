const sinon = require('sinon');
const appRoot = require('app-root-path');

const conn = appRoot.require('api/v1/db/oracledb/connection');

const createConnStub = (testCase) => {
  const executeStub = sinon.stub().returns(testCase ? testCase.data : null);
  sinon.stub(conn, 'getConnection').resolves({
    execute: executeStub,
    close: () => null,
  });
  return {
    executeStub,
  };
};

module.exports = { createConnStub };
