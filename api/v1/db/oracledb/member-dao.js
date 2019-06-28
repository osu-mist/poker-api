const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeMembers, serializeMember } = require('../../serializers/members-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');


/**
 * @summary Return a list of members
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of members
 */
const getMembers = async (query) => {
  const connection = await conn.getConnection();
  const memberNickname = query ? query.memberNickname : null;
  const memberEmail = query ? query.memberEmail : null;
  try {
    const sqlParams = {};
    if (memberNickname) {
      sqlParams.memberNickname = memberNickname;
    }
    if (memberEmail) {
      sqlParams.memberEmail = memberEmail;
    }
    const sqlQuery = `
    SELECT MEMBER_ID, MEMBER_NICKNAME, MEMBER_EMAIL, MEMBER_LEVEL, MEMBER_EXP_OVER_LEVEL FROM MEMBERS 
    WHERE 1 = 1 
    ${memberNickname ? 'AND MEMBER_NICKNAME = :memberNickname ' : ''} 
    ${memberEmail ? 'AND MEMBER_EMAIL = :memberEmail' : ''}
    `;
    const rawMembersResponse = await connection.execute(sqlQuery, sqlParams);
    const rawMembers = rawMembersResponse.rows;
    const serializedMembers = serializeMembers(rawMembers, query);

    return serializedMembers;
  } finally {
    connection.close();
  }
};

/**
 * @summary Return a specific member by unique ID
 * @function
 * @param {string} id Unique member ID
 * @returns {Promise<Object>} Promise object represents a specific member
 *                            or return undefined if term
 *                            is not found
 */
const getMemberById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlQuery = `
    SELECT MEMBER_ID, MEMBER_NICKNAME, MEMBER_EMAIL, MEMBER_LEVEL, MEMBER_EXP_OVER_LEVEL 
    FROM MEMBERS WHERE MEMBER_ID = :id
    `;
    const sqlParams = [id];
    const rawMembersResponse = await connection.execute(sqlQuery, sqlParams);
    const rawMembers = rawMembersResponse.rows;
    if (_.isEmpty(rawMembers)) {
      return undefined;
    }
    if (rawMembers.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedMember = serializeMember(rawMembers);
      return serializedMember;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getMembers, getMemberById };
