const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');
const sinon = require('sinon');
const config = require('config');
const testData = require('./test-data');

sinon.restore();

const {
  testSingleResource,
  testMultipleResources,
} = require('./test-util');

const memberSerializer = appRoot.require('api/v1/serializers/members-serializer');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);

describe('Test members-serializer', () => {
  const { rawMembers } = testData;
  const resourceType = 'member';
  const id = 'MEMBER_ID';

  afterEach(() => sinon.restore());

  it('Should return a valid JSON object that follow the OpenAPI specification', () => {
    sinon.replace(config, 'get', () => ({ oracledb: {} }));
    const { serializeMember } = memberSerializer;
    const serializedMember = serializeMember(rawMembers[0]);
    testSingleResource(serializedMember,
      resourceType,
      rawMembers[0][id],
      _.omit(rawMembers[0], id));
  });

  it('Should return an array of valid JSON objects that follow the OpenAPI specification', () => {
    sinon.replace(config, 'get', () => ({ oracledb: {} }));
    const { serializeMembers } = memberSerializer;

    const serializedMembers = serializeMembers(rawMembers, testData.fakeMemberQuery);
    testMultipleResources(serializedMembers);

    for (let i = 0; i < serializedMembers.length; i += 1) {
      testSingleResource(serializedMembers[i],
        resourceType,
        rawMembers[i][id],
        _.omit(rawMembers[i], id));
    }
  });
});
