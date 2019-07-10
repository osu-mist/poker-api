const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeGames, serializeGame } = require('../../serializers/games-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

const sqlQuery = `
    SELECT CN.CARD_NUMBER, CS.SUIT, G.GAME_ID, R.ROUND, G.MAXIMUM_BET,
    G.MINIMUM_BET, G.BET_POOL
    FROM GAMES G
    INNER JOIN ROUNDS R ON G.ROUND_ID = R.ROUND_ID
    LEFT OUTER JOIN TABLE_CARDS TC ON TC.GAME_ID = G.GAME_ID
    LEFT OUTER JOIN CARDS C ON TC.CARD_ID = C.CARD_ID
    LEFT OUTER JOIN CARD_NUMBERS CN ON C.CARD_NUMBER_ID = CN.CARD_NUMBER_ID
    LEFT OUTER JOIN CARD_SUITS CS ON C.CARD_SUIT_ID = CS.SUIT_ID
    `;
/**
 * @summary Return a list of games
 * @function
 * @param {Object} query query object that contains useful information to process.
 * @returns {Promise<Object[]>} Promise object represents a list of games
 */
const getGames = async (query) => {
  const connection = await conn.getConnection();
  const round = query ? query.round : null;

  try {
    const sqlParams = {};
    if (round) {
      sqlParams.round = round;
    }
    const getGamesSqlQuery = `${sqlQuery} ${round ? 'WHERE R.ROUND = :round' : ''}`;
    const rawGamesResponse = await connection.execute(getGamesSqlQuery, sqlParams);
    const rawGames = rawGamesResponse.rows;
    const serializedGames = serializeGames(rawGames, query);
    return serializedGames;
  } finally {
    connection.close();
  }
};


const getGamesByMemberId = async (id, query) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id];
    const getMemberSqlQuery = `SELECT COUNT(1) FROM MEMBERS M
    WHERE M.MEMBER_ID = :id
    `;
    const rawMemberResponse = await connection.execute(getMemberSqlQuery, sqlParams);
    const memberCount = parseInt(rawMemberResponse.rows[0]['COUNT(1)'], 10);
    if (memberCount < 1) {
      return undefined;
    }
    const getSqlQuery = `${sqlQuery}
    LEFT OUTER JOIN PLAYERS P ON P.GAME_ID = G.GAME_ID
    WHERE P.MEMBER_ID = :id
    `;
    const rawGamesResponse = await connection.execute(getSqlQuery, sqlParams);
    const rawGames = rawGamesResponse.rows;
    const serializedGames = serializeGames(rawGames, query, id);
    return serializedGames;
  } finally {
    connection.close();
  }
};

const getGameById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id];
    const getGameByIdSqlQuery = `${sqlQuery} WHERE G.GAME_ID = :id`;
    const rawGamesResponse = await connection.execute(getGameByIdSqlQuery, sqlParams);
    const rawGames = rawGamesResponse.rows;
    const groupedRawGames = _.groupBy(rawGames, 'GAME_ID');
    if (_.isEmpty(groupedRawGames)) {
      return undefined;
    }
    if (_.keys(groupedRawGames).length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedGame = serializeGame(rawGames);
      return serializedGame;
    }
  } finally {
    connection.close();
  }
};

/**
 * @summary Check the if the game with the id exists.
 * @function
 * @param {Int} id The id of the game
 * @returns {Bool} If the game exists or not.
 */
const validateGame = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id];
    const validateSqlQuery = `
    SELECT COUNT(1) FROM GAMES G
    WHERE G.GAME_ID = :id
    `;
    const rawGamesResponse = await connection.execute(validateSqlQuery, sqlParams);
    const gameCount = parseInt(rawGamesResponse.rows[0]['COUNT(1)'], 10);
    return !(gameCount < 1);
  } finally {
    connection.close();
  }
};

module.exports = {
  getGames, getGameById, getGamesByMemberId, validateGame,
};
