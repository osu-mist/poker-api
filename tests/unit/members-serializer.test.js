const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');
const testData = require('./test-data');
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

  it('Should return a valid JSON object that follow the OpenAPI specification', () => {
    const { serializeMember } = memberSerializer;
    const serializedMember = serializeMember(rawMembers[0]);
    testSingleResource(serializedMember,
      resourceType,
      rawMembers[0][id],
      _.omit(rawMembers[0], id));
  });

  it('Should return an array of valid JSON objects that follow the OpenAPI specification', () => {
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
