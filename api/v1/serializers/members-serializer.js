const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const memberResourceProp = openapi.definitions.MemberResource.properties;
const memberResourceType = memberResourceProp.type.enum[0];
const memberResourceKeys = _.keys(memberResourceProp.attributes.properties);
const memberResourcePath = 'members';
const memberResourceUrl = resourcePathLink(apiBaseUrl, memberResourcePath);

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in openapi.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(memberResourceKeys, (key, index) => {
  memberResourceKeys[index] = decamelize(key).toUpperCase();
});

const singleMemberConverter = (rawMember) => {
  rawMember.MEMBER_LEVEL = parseInt(rawMember.MEMBER_LEVEL, 10);
  rawMember.MEMBER_EXP_OVER_LEVEL = parseInt(rawMember.MEMBER_EXP_OVER_LEVEL, 10);
};

/**
 * @summary Serialize memberResources to JSON API
 * @function
 * @param {[Object]} rawMembers Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized memberResources object
 */
const serializeMembers = (rawMembers, query) => {
  _.forEach(rawMembers, (member) => {
    singleMemberConverter(member);
  });

  const topLevelSelfLink = paramsLink(memberResourceUrl, query);
  const serializerArgs = {
    identifierField: 'MEMBER_ID',
    resourceKeys: memberResourceKeys,
    resourcePath: memberResourcePath,
    topLevelSelfLink,
    query,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    memberResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawMembers);
};

/**
 * @summary Serialize memberResource to JSON API
 * @function
 * @param {Object} rawMember Raw data row from data source
 * @returns {Object} Serialized memberResource object
 */
const serializeMember = (rawMember, isPost = false) => {
  singleMemberConverter(rawMember);

  const topLevelSelfLink = resourcePathLink(memberResourceUrl, rawMember.MEMBER_ID);
  const serializerArgs = {
    identifierField: 'MEMBER_ID',
    resourceKeys: memberResourceKeys,
    resourcePath: memberResourcePath,
    topLevelSelfLink: isPost ? memberResourceUrl : topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    memberResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawMember);
};


module.exports = { serializeMembers, serializeMember, singleMemberConverter };
