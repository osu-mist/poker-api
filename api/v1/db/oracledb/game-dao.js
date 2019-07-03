const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeGames, serializeGame } = require('../../serializers/games-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const mergeRawGames = (rawGames) => {
  const groupedRawGames = _.groupBy(rawGames, 'GAME_ID');
  const mergedRawGames = _.map(groupedRawGames, (gameMetaDataArray) => {
    if (gameMetaDataArray[0].CARD_NUMBER == null) {
      gameMetaDataArray[0].tableCards = [];
    } else {
      gameMetaDataArray[0].tableCards = _.map(gameMetaDataArray, (data) => {
        return {
          cardNumber: data.CARD_NUMBER,
          cardSuit: data.SUIT,
        };
      });
    }
    return (gameMetaDataArray[0]);
  });
  return mergedRawGames;
};

/**
 * @summary Return a list of games
 * @function
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
    const sqlQuery = `
    SELECT CN.CARD_NUMBER, CS.SUIT, G.GAME_ID, R.ROUND, G.MAXIMUM_BET, 
    G.MINIMUM_BET, G.BET_POOL 
    FROM GAMES G
    INNER JOIN ROUNDS R ON G.ROUND_ID = R.ROUND_ID 
    LEFT OUTER JOIN TABLE_CARDS TC ON TC.GAME_ID = G.GAME_ID 
    LEFT OUTER JOIN CARDS C ON TC.CARD_ID = C.CARD_ID 
    LEFT OUTER JOIN CARD_NUMBERS CN ON C.CARD_NUMBER_ID = CN.CARD_NUMBER_ID 
    LEFT OUTER JOIN CARD_SUITS CS ON C.CARD_SUIT_ID = CS.SUIT_ID 
    ${round ? 'AND ROUNDS.ROUND = :round' : ''}
    `;
    const rawGamesResponse = await connection.execute(sqlQuery, sqlParams);
    let rawGames = rawGamesResponse.rows;
    rawGames = mergeRawGames(rawGames);
    const serializedGames = serializeGames(rawGames, query);
    return serializedGames;
  } finally {
    connection.close();
  }
};

const getGameById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlQuery = `
    SELECT CN.CARD_NUMBER, CS.SUIT, G.GAME_ID, R.ROUND, G.MAXIMUM_BET, 
    G.MINIMUM_BET, G.BET_POOL 
    FROM GAMES G
    INNER JOIN ROUNDS R ON G.ROUND_ID = R.ROUND_ID 
    LEFT OUTER JOIN TABLE_CARDS TC ON TC.GAME_ID = G.GAME_ID 
    LEFT OUTER JOIN CARDS C ON TC.CARD_ID = C.CARD_ID 
    LEFT OUTER JOIN CARD_NUMBERS CN ON C.CARD_NUMBER_ID = CN.CARD_NUMBER_ID 
    LEFT OUTER JOIN CARD_SUITS CS ON C.CARD_SUIT_ID = CS.SUIT_ID 
    WHERE G.GAME_ID = :id
    `;
    const sqlParams = [id];
    const rawGamesResponse = await connection.execute(sqlQuery, sqlParams);
    let rawGames = rawGamesResponse.rows;
    [rawGames] = mergeRawGames(rawGames);
    if (_.isEmpty(rawGames)) {
      return undefined;
    }
    if (rawGames.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      console.log(rawGames);
      const serializedGame = serializeGame(rawGames);
      return serializedGame;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getGames, getGameById };
