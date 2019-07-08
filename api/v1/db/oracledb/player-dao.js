const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializePlayers, serializePlayer } = require('../../serializers/players-serializer');

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

const gameSqlQuery = `
  SELECT * FROM GAMES G
  WHERE G.GAME_ID = :id
  `;

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
  `;

const getPlayersByGameId = async (id, query) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id];

    const rawGamesResponse = await connection.execute(gameSqlQuery, sqlParams);
    const rawGames = rawGamesResponse.rows;
    if (_.isEmpty(rawGames)) {
      return undefined;
    }
    const getSqlQuery = `
    ${sqlQuery}
    WHERE G.GAME_ID = :id
    `;
    const rawPlayersResponse = await connection.execute(getSqlQuery, sqlParams);
    let rawPlayers = rawPlayersResponse.rows;
    rawPlayers = mergeRawPlayers(rawPlayers);
    const serializedPlayers = serializePlayers(rawPlayers, query, id);
    return serializedPlayers;
  } finally {
    connection.close();
  }
};

const getPlayersByGameIdAndPlayerId = async (id, pid) => {
  const connection = await conn.getConnection();
  try {
    let sqlParams = [id];
    const rawGamesResponse = await connection.execute(gameSqlQuery, sqlParams);
    const rawGames = rawGamesResponse.rows;
    if (_.isEmpty(rawGames)) {
      return undefined;
    }

    sqlParams = [id, pid];
    const getSqlQuery = `${sqlQuery}
    WHERE G.GAME_ID = :id
    AND P.PLAYER_ID = :pid
    `;
    const rawPlayersResponse = await connection.execute(getSqlQuery, sqlParams);
    let rawPlayers = rawPlayersResponse.rows;
    rawPlayers = mergeRawPlayers(rawPlayers);
    if (_.isEmpty(rawPlayers)) {
      return undefined;
    }
    if (rawPlayers.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [firstRawPlayer] = rawPlayers;
      const serializedPlayer = serializePlayer(firstRawPlayer, id, pid);
      return serializedPlayer;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getPlayersByGameId, getPlayersByGameIdAndPlayerId };
