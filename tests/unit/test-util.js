const sinon = require('sinon');
const { expect } = require('chai');
const appRoot = require('app-root-path');
const camelCase = require('camelcase');
const _ = require('lodash');
const config = require('config');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const { openapi } = appRoot.require('utils/load-openapi');
const { fakeBaseUrl } = require('./test-data');

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

const resourceSchema = (resourceType, resourceId, resourceAttributes) => {
  const fakeUrl = `/${fakeBaseUrl}/${resourceType}s/${resourceId}`;
  const schema = {
    links: {
      self: fakeUrl,
    },
    data: {
      id: resourceId,
      type: resourceType,
      links: {
        self: fakeUrl,
      },
    },
  };
  if (resourceAttributes) {
    resourceAttributes = _.mapKeys(resourceAttributes,
      (value, key) => camelCase(key.toLowerCase()));
    schema.data.attributes = resourceAttributes;
  }
  return schema;
};

const getDefinition = (def) => {
  const result = openapi.definitions[def].properties.data.properties;
  return result;
};

const testSingleResource = (serializedResource, resourceType, resourceId, nestedProps) => {
  expect(serializedResource).to.containSubset(resourceSchema(resourceType,
    resourceId,
    nestedProps));
};

const testMultipleResources = (serializedResources) => {
  expect(serializedResources).to.have.all.keys('data', 'links');
  expect(serializedResources.data).to.be.an('array');
  getDefinition('MemberResult');
};


module.exports = {
  createConnStub,
  resourceSchema,
  testSingleResource,
  testMultipleResources,
  getDefinition,
};
