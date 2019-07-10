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
 * @returns {Promise<Object>} Promise object represents a specific member or return undefined if
 *  term is not found
 */
const getMemberById = async () => {
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

/**
 * @summary Check through each memberId in the memberIds attribute and make sure all of them exist
 * in the database.
 * @function
 * @param {Object} body Request body from client
 * @returns {Boolean} If all of the memberId in memberIds exist or not.
 */
const validateMembers = async (body) => {
  const { memberIds } = body.data.attributes;
  const connection = await conn.getConnection();
  try {
    /**
     * If memberIds is empty, simply create the game without inserting player into the database.
     */
    if (!_.isEmpty(memberIds)) {
      const sqlQuery = `SELECT COUNT(1) FROM MEMBERS WHERE MEMBER_ID IN (${memberIds.map((name, index) => `:${index}`).join(', ')})`;
      const rawMemberResponse = await connection.execute(sqlQuery, memberIds);
      const memberCount = parseInt(rawMemberResponse.rows[0]['COUNT(1)'], 10);
      return memberCount === memberIds.length;
    }
    return true;
  } finally {
    connection.close();
  }
};

const hasDuplicateMemberId = (body) => {
  const { memberIds } = body.data.attributes;
  return !(_.size(_.uniq(memberIds)) === _.size(memberIds));
};

module.exports = {
  getMembers, getMemberById, validateMembers, hasDuplicateMemberId,
};
