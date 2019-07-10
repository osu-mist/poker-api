const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializePlayers, serializePlayer } = require('../../serializers/players-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');


const gameSqlQuery = `
  SELECT * FROM GAMES G
  WHERE G.GAME_ID = :id
  `;

const sqlQuery = `
  SELECT P.PLAYER_ID,
         P.MEMBER_ID,
         M.MEMBER_NICKNAME,
         M.MEMBER_LEVEL,
         M.MEMBER_EXP_OVER_LEVEL,
         P.PLAYER_BET,
         S.STATUS AS PLAYER_STATUS,
         CN.CARD_NUMBER,
         CS.SUIT
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
    const gameSqlQuery = `
    SELECT COUNT(1) FROM GAMES G
    WHERE G.GAME_ID = :id
    `;
    const rawGamesResponse = await connection.execute(gameSqlQuery, sqlParams);
    const gameCount = parseInt(rawGamesResponse.rows[0]['COUNT(1)'], 10);
    if (gameCount < 1) {
      return undefined;
    }
    const getSqlQuery = `
    ${sqlQuery}
    WHERE G.GAME_ID = :id
    `;
    const rawPlayersResponse = await connection.execute(getSqlQuery, sqlParams);
    const rawPlayers = rawPlayersResponse.rows;
    const serializedPlayers = serializePlayers(rawPlayers, query, id);
    return serializedPlayers;
  } finally {
    connection.close();
  }
};


const getPlayerByGameIdAndPlayerId = async (id, pid) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id, pid];
    const getSqlQuery = `${sqlQuery}
    WHERE G.GAME_ID = :id
    AND P.PLAYER_ID = :pid
    `;
    const rawPlayersResponse = await connection.execute(getSqlQuery, sqlParams);
    const rawPlayers = rawPlayersResponse.rows;
    const groupedRawPlayers = _.groupBy(rawPlayers, 'GAME_ID');
    if (_.isEmpty(groupedRawPlayers)) {
      return undefined;
    }
    if (_.keys(groupedRawPlayers).length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedPlayer = serializePlayer(rawPlayers, id, pid);
      return serializedPlayer;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getPlayersByGameId, getPlayerByGameIdAndPlayerId };
