const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeGames } = require('../../serializers/games-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

const getGames = async (query) => {
    const connection = await conn.getConnection();
    const roundId = query ? query.roundId : null;

    try {
      const sqlParams = {};
      if (roundId) {
          sqlParams.roundId = roundId;
      }
      const sqlQuery = `
      SELECT * FROM GAMES, ROUNDS 
      WHERE GAMES.ROUND_ID = ROUNDS.ROUND_ID 
      ${roundId ? 'AND ROUND_ID = :roundId' : ''}
      `;
      const rawGamesResponse = await connection.execute(sqlQuery, sqlParams);
      const rawGames = rawGamesResponse.rows;
      console.log(rawGames);
      const serializedGames = serializeGames(rawGames, query);
  
      return serializedGames;
    } finally {
      connection.close();
    }
  };

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

  module.exports = { getGamesByMemberId, getGames };

  