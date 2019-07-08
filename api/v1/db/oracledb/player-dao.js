const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializePlayers } = require('../../serializers/players-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

const mergeRawPlayers = (rawPlayers) => {
  const groupedRawPlayers = _.groupBy(rawPlayers, 'PLAYER_ID');
  const mergedRawPlayers = _.map(groupedRawPlayers, (playerMetaDataArray) => {
    playerMetaDataArray[0].playerCards = playerMetaDataArray[0].CARD_NUMBER === null ? []
      : _.map(playerMetaDataArray, data => ({
        cardNumber: data.CARD_NUMBER,
        cardSuit: data.SUIT,
      }));
    return playerMetaDataArray[0];
  });
  return mergedRawPlayers;
};

const getPlayersByGameId = async (id, query) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id];
    const gameSqlQuery = `
    SELECT * FROM GAMES G
    WHERE G.GAME_ID = :id
    `;
    const rawGamesResponse = await connection.execute(gameSqlQuery, sqlParams);
    const rawGames = rawGamesResponse.rows;
    if (_.isEmpty(rawGames)) {
      return undefined;
    }
    const sqlQuery = `
    SELECT P.PLAYER_ID, P.MEMBER_ID, M.MEMBER_NICKNAME, M.MEMBER_LEVEL, M.MEMBER_EXP_OVER_LEVEL, P.PLAYER_BET, S.STATUS AS PLAYER_STATUS, CN.CARD_NUMBER, CS.SUIT
    FROM PLAYERS P
    INNER JOIN GAMES G ON G.GAME_ID = P.GAME_ID
    INNER JOIN STATUSES S ON S.STATUS_ID = P.STATUS_ID
    INNER JOIN MEMBERS M ON M.MEMBER_ID = P.MEMBER_ID
    LEFT OUTER JOIN PLAYER_CARDS PC ON PC.PLAYER_ID = P.PLAYER_ID
    LEFT OUTER JOIN CARDS C ON PC.CARD_ID = C.CARD_ID
    LEFT OUTER JOIN CARD_NUMBERS CN ON C.CARD_NUMBER_ID = CN.CARD_NUMBER_ID
    LEFT OUTER JOIN CARD_SUITS CS ON C.CARD_SUIT_ID = CS.SUIT_ID
    WHERE G.GAME_ID = :id
    `;
    const rawPlayersResponse = await connection.execute(sqlQuery, sqlParams);
    let rawPlayers = rawPlayersResponse.rows;
    rawPlayers = mergeRawPlayers(rawPlayers);
    const serializedPlayers = serializePlayers(rawPlayers, query, id);
    return serializedPlayers;
  } finally {
    connection.close();
  }
};

module.exports = { getPlayersByGameId };
