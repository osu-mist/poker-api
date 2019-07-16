const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

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

const postPlayerByGameId = async (body, gameId) => {
  const connection = await conn.getConnection();
  try {
    body = body.data.attributes;
    body.outId = {
      type: oracledb.NUMBER,
      dir: oracledb.BIND_OUT,
    };

    const { playerCards } = body;
    delete body.playerCards;
    const postSqlQuery = `
    INSERT INTO PLAYERS (MEMBER_ID, GAME_ID, PLAYER_BET, STATUS_ID)
    VALUES (:memberId,
           ${gameId},
           :playerBet,
           (SELECT STATUS_ID FROM STATUSES WHERE STATUSES.STATUS = :playerStatus)) RETURNING PLAYER_ID INTO :outId
    `;
    const rawPlayer = await connection.execute(postSqlQuery, body, { autoCommit: true });
    const promiseArray = [];
    const playerId = rawPlayer.outBinds.outId[0];
    console.log(playerId);
    console.log(playerCards);
    _.forEach(playerCards, (card) => {
      console.log(card);
      const cardSqlQuery = `INSERT INTO PLAYER_CARDS (PLAYER_ID, CARD_ID) VALUES
      (${playerId},
       (SELECT CARD_ID FROM CARDS C
        INNER JOIN CARD_SUITS CS ON CS.SUIT_ID = C.CARD_SUIT_ID
        INNER JOIN CARD_NUMBERS CN ON CN.CARD_NUMBER_ID = C.CARD_NUMBER_ID
        WHERE SUIT = :cardSuit AND CARD_NUMBER = :cardNumber
       )
      )`;
      promiseArray.push(connection.execute(cardSqlQuery, card, { autoCommit: true }));
    });
    await Promise.all(promiseArray);

    const result = await getPlayerByGameIdAndPlayerId(gameId, playerId);
    return result;

  } finally {

  }
};

module.exports = { getPlayersByGameId, getPlayerByGameIdAndPlayerId, postPlayerByGameId };
