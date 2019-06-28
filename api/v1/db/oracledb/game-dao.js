const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeMembers, serializeMember } = require('../../serializers/members-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of members
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of members
 */
const getGamesByMemberId = async (query) => {
    const connection = await conn.getConnection();
    try {
        const rawGames = await connection.execute('SELECT * FROM GAMES, PLAYERS WHERE GAMES.GAME_ID = PLAYERS.GAME_ID AND PLAYERS.MEMBER_ID = 1');

        console.log(rawGames);
        if (_.isEmpty(rawGames)) {
        return undefined;
        }
        if (rawGames.length > 1) {
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

  module.exports = { getGamesByMemberId };