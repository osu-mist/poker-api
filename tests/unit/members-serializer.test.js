const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');
const sinon = require('sinon');
const config = require('config');

const testData = require('./test-data');
const {
  testSingleResource,
  testMultipleResources,
} = require('./test-util');

const memberSerializer = appRoot.require('api/v1/serializers/members-serializer');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);

describe('Test memberSerializer', () => {
  const {
    rawMembers,
    rawMemberToConvert,
    rawMemberConverted,
  } = testData;
  const resourceType = 'member';
  const memberId = 'MEMBER_ID';

  afterEach(() => sinon.restore());


  describe('Test memberSerializer', () => {
    it('Should return a valid JSON object that follow the OpenAPI specification', () => {
      sinon.replace(config, 'get', () => ({ oracledb: {} }));
      const { serializeMember } = memberSerializer;
      const serializedMember = serializeMember(rawMembers[0]);
      testSingleResource(serializedMember,
        resourceType,
        rawMembers[0][memberId],
        _.omit(rawMembers[0], memberId));
    });
  });

  describe('Test singleMemberConverter', () => {
    it('Should convert with all valid fields', () => {
      const { singleMemberConverter } = memberSerializer;
      singleMemberConverter(rawMemberToConvert);
      chai.expect(rawMemberToConvert).to.deep.equal(rawMemberConverted);
    });
  });

  describe('Test membersSerializer', () => {
    it('Should return an array of valid JSON objects that follow the OpenAPI specification', () => {
      sinon.replace(config, 'get', () => ({ oracledb: {} }));
      const { serializeMembers } = memberSerializer;

      const serializedMembers = serializeMembers(rawMembers, testData.fakeMemberQuery);
      testMultipleResources(serializedMembers, rawMembers, resourceType, memberId);
    });
  });
});
