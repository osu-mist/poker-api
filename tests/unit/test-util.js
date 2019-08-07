const sinon = require('sinon');
const { expect } = require('chai');
const appRoot = require('app-root-path');
const camelCase = require('camelcase');
const _ = require('lodash');
const config = require('config');

sinon.stub(config, 'get').returns({ oracledb: {} });
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
  console.log(serializedResource);
  console.log(resourceSchema(resourceType,
    resourceId,
    nestedProps));
  expect(serializedResource).to.deep.equal(resourceSchema(resourceType,
    resourceId,
    nestedProps));
};

const testMultipleResources = (serializedResources, rawResources, resourceType, resourceKey) => {
  expect(serializedResources).to.have.all.keys('data', 'links');
  expect(serializedResources.data).to.be.an('array');
  _.zipWith(serializedResources.data, rawResources, (a, b) => {
    expect(a).to.deep.equal(resourceSchema(resourceType,
      b[resourceKey],
      _.omit(b, resourceKey)).data);
  });
};


module.exports = {
  createConnStub,
  resourceSchema,
  testSingleResource,
  testMultipleResources,
  getDefinition,
};
