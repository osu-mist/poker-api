const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializePlayers, serializePlayer } = require('../../serializers/players-serializer');
const { validateGame } = require('./game-dao');

const conn = appRoot.require('api/v1/db/oracledb/connection');


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
    if (!(await validateGame(id))) {
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
      const serializedPlayer = serializePlayer(rawPlayers, id);
      return serializedPlayer;
    }
  } finally {
    connection.close();
  }
};

const cleanPlayerCardsByPlayerId = async (playerId) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [playerId];
    const deleteSqlQuery = `
    DELETE FROM PLAYER_CARDS WHERE PLAYER_ID = :playerId
    `;
    const result = await connection.execute(deleteSqlQuery, sqlParams, { autoCommit: true });
    return result;
  } finally {
    connection.close();
  }
};

const deletePlayerByPlayerId = async (playerId) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [playerId];
    const deleteSqlQuery = `
    DELETE FROM PLAYERS WHERE PLAYER_ID = :playerId
    `;
    const result = await connection.execute(deleteSqlQuery, sqlParams, { autoCommit: true });
    return result;
  } finally {
    connection.close();
  }
};

module.exports = {
  getPlayersByGameId,
  getPlayerByGameIdAndPlayerId,
  cleanPlayerCardsByPlayerId,
  deletePlayerByPlayerId,
};
