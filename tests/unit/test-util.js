const sinon = require('sinon');
const { expect } = require('chai');
const appRoot = require('app-root-path');
const camelCase = require('camelcase');
const _ = require('lodash');
const config = require('config');

const { fakeBaseUrl } = require('./test-data');

sinon.stub(config, 'get').returns({ oracledb: {} });
const conn = appRoot.require('api/v1/db/oracledb/connection');
const { openapi } = appRoot.require('utils/load-openapi');

/**
 * @summary Create the stub for connection object that is useful for controlled testing environment.
 * @function
 * @param {object} testCase The testcase that becomes the return value of connection.execute
 * in the stub.
 * @returns {object} An object of all the interal function stub created for this stub.
 */
const createConnStub = (testCase) => {
  const executeStub = sinon.stub().returns(testCase ? testCase.data : null);
  sinon.stub(conn, 'getConnection').resolves({
    execute: executeStub,
    close: () => null,
    commit: () => null,
  });
  return {
    executeStub,
  };
};

/**
 * @summary Transoform the rawData into serializedData.
 * @param {string} resourceType The type of resource.
 * @param {string} resourceId The id of resource.
 * @param {object} resourceAttributes The attribute of the resource.
 * @returns {object} Expected serialized rawData.
 */
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

/**
 * Get the schema of a type of resource.
 *
 * @param {string} def The type of the resource.
 * @returns {object} The schema of the resource to look up.
 */
const getDefinition = (def) => {
  const result = openapi.definitions[def].properties.data.properties;
  return result;
};

/**
 * @summary Test if a single resource matches the schema in the specification.
 * @param {object} serializedResource serialized resource to be tested.
 * @param {string} resourceType The type of the resource.
 * @param {string} resourceId The id of the resource.
 * @param {object} nestedProps The attributes of the resource.
 */
const testSingleResource = (serializedResource, resourceType, resourceId, nestedProps) => {
  expect(serializedResource).to.deep.equal(resourceSchema(resourceType,
    resourceId,
    nestedProps));
};

/**
 * Validate multiple serialized resources.
 *
 * @param {object} serializedResources serialized resource to be tested.
 * @param {object} rawResources Raw resources to be used in test.
 * @param {*} resourceType The type of the resource.
 * @param {*} resourceKey The id of the resource.
 */
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
