const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const { serializeMembers, serializeMember } = require('../../serializers/members-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');
//const { contrib } = appRoot.require('api/v1/db/oracledb/contrib/contrib');

const { endpointUri } = config.get('server');

/**
 * @summary Return a list of members
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of members
 */
const getMembers = async (query) => {
  const connection = await conn.getConnection();
  try {
    const SQLquery = `SELECT MEMBER_ID, MEMBER_NICKNAME, MEMBER_EMAIL, MEMBER_LEVEL, MEMBER_EXP_OVER_LEVEL FROM MEMBERS`;
    const rawMembers = await connection.execute(SQLquery);
    const rawMembersRow = rawMembers.rows;
    console.log(rawMembers);
    const serializedMembers = serializeMembers(rawMembersRow, query);
    return serializedMembers;
  } finally {
    connection.close();
  }
};

/**
 * @summary Return a specific member by unique ID
 * @function
 * @param {string} id Unique member ID
 * @returns {Promise<Object>} Promise object represents a specific member or return undefined if term
 *                            is not found
 */
const getMemberById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const { rawMembers } = await connection.execute();

    if (_.isEmpty(rawMembers)) {
      return undefined;
    }
    if (rawMembers.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [rawMember] = rawMembers;
      const serializedMember = serializeMember(rawMember);
      return serializedMember;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getMembers, getMemberById };
