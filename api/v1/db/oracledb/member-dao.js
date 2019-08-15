const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');
const decamelize = require('decamelize');

const { serializeMembers, serializeMember } = require('../../serializers/members-serializer');
const playerDao = require('./player-dao');

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
const getMemberById = async (id, isPost = false) => {
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
      const serializedMember = serializeMember(rawMembers[0], isPost);
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
 * @param {Array[number]} memberIds Request body from client
 * @returns {Promise<boolean>} If all of the memberId in memberIds exist or not.
 */
const validateMembers = async (memberIds) => {
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


/**
 * @summary Post a new member into the system.
 * @function
 * @param {Object} body The post body from request object.
 * @returns {Promise<Object>} The JSON resource of the new member created.
 */
const postMember = async (body) => {
  const connection = await conn.getConnection();
  try {
    body = body.data.attributes;
    body.outId = {
      type: oracledb.NUMBER,
      dir: oracledb.BIND_OUT,
    };

    const postSqlQuery = `INSERT INTO MEMBERS (MEMBER_NICKNAME,
                                               MEMBER_EMAIL,
                                               MEMBER_LEVEL,
                                               MEMBER_EXP_OVER_LEVEL,
                                               MEMBER_PASSWORD)
    VALUES
    (:memberNickname, :memberEmail, 1, 0, :memberPassword) RETURNING MEMBER_ID INTO :outId`;
    const rawMembers = await connection.execute(postSqlQuery, body, { autoCommit: true });

    const memberId = rawMembers.outBinds.outId[0];

    const result = await getMemberById(memberId, true);
    return result;
  } finally {
    connection.close();
  }
};

const hasDuplicateMemberId = memberIds => (!(_.size(_.uniq(memberIds)) === _.size(memberIds)));

const isMemberAlreadyRegistered = async (nickname, email) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [nickname, email];
    const checkSqlQuery = `
      SELECT COUNT(1) FROM MEMBERS M
      WHERE M.MEMBER_NICKNAME = :nickname
      OR M.MEMBER_EMAIL = :email
      `;
    const rawMemberResponse = await connection.execute(checkSqlQuery, sqlParams);
    const memberCount = parseInt(rawMemberResponse.rows[0]['COUNT(1)'], 10);
    return memberCount > 0;
  } finally {
    connection.close();
  }
};

const deleteMember = async (memberId) => {
  const connection = await conn.getConnection();
  try {
    await playerDao.deletePlayersByMemberId(memberId, connection);
    const delSqlQuery = `
      DELETE FROM MEMBERS WHERE MEMBER_ID = :id
      `;
    const sqlParams = {
      id: memberId,
    };
    const result = await connection.execute(delSqlQuery, sqlParams, { autoCommit: true });
    return result;
  } finally {
    connection.close();
  }
};

const databaseName = string => (decamelize(string).toUpperCase());

const isTruthyOrZero = val => (val || val === 0);

const patchMember = async (memberId, attributes) => {
  const connection = await conn.getConnection();
  try {
    const filteredAttributes = _.pickBy(attributes, isTruthyOrZero);
    if (_.isEmpty(filteredAttributes)) {
      return true;
    }
    const joinedStringArray = _.map(filteredAttributes,
      (value, key) => (`${isTruthyOrZero(value) ? `${databaseName(key)} = :${key}` : ''}`));
    const joinedString = _(joinedStringArray).compact().join(', ');
    const sqlQuery = `
      UPDATE MEMBERS
      SET ${joinedString}
      WHERE MEMBER_ID = :id
      `;
    filteredAttributes.id = memberId;
    const response = await connection.execute(sqlQuery, filteredAttributes, { autoCommit: true });
    return response.rowsAffected > 0;
  } finally {
    connection.close();
  }
};

module.exports = {
  getMembers,
  getMemberById,
  validateMembers,
  hasDuplicateMemberId,
  postMember,
  isMemberAlreadyRegistered,
  deleteMember,
  patchMember,
  isTruthyOrZero,
  databaseName,
};
