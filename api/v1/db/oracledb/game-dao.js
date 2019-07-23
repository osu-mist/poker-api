const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

const decamelize = require('decamelize');

const { serializeGames, serializeGame } = require('../../serializers/games-serializer');
const playerDao = require('./player-dao');

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


const getGameById = async (id, isPost = false) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id];
    const getGameByIdSqlQuery = `${sqlQuery} ${id ? 'WHERE G.GAME_ID = :id' : ''}`;
    const rawGamesResponse = await connection.execute(getGameByIdSqlQuery, sqlParams);
    const rawGames = rawGamesResponse.rows;
    const groupedRawGames = _.groupBy(rawGames, 'GAME_ID');
    if (_.isEmpty(groupedRawGames)) {
      return undefined;
    }
    if (_.keys(groupedRawGames).length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedGame = serializeGame(rawGames, isPost);
      return serializedGame;
    }
  } finally {
    connection.close();
  }
};

const postGame = async (body) => {
  const connection = await conn.getConnection();
  try {
    body = body.data.attributes;
    body.outId = {
      type: oracledb.NUMBER,
      dir: oracledb.BIND_OUT,
    };
    body.round = body.round.charAt(0).toUpperCase();

    const { memberIds } = body;

    delete body.memberIds;
    const postSqlQuery = `INSERT INTO GAMES (ROUND_ID, MINIMUM_BET, MAXIMUM_BET, BET_POOL) VALUES
    (:round, :minimumBet, :maximumBet, :betPool) RETURNING GAME_ID INTO :outId`;
    const rawGames = await connection.execute(postSqlQuery, body, { autoCommit: true });
    const promiseArray = [];
    const gameId = rawGames.outBinds.outId[0];
    _.forEach(memberIds, (id) => {
      const playerSqlParams = {
        gameId,
        memberId: id,
      };
      const playerSqlQuery = `INSERT INTO PLAYERS (MEMBER_ID, GAME_ID, PLAYER_BET, STATUS_ID) VALUES
      (:memberId, :gameId, 0, 'CH')`;
      promiseArray.push(connection.execute(playerSqlQuery, playerSqlParams, { autoCommit: true }));
    });
    await Promise.all(promiseArray);

    const result = await getGameById(rawGames.outBinds.outId[0], true);
    return result;
  } finally {
    connection.close();
  }
};
/**
 * @summary Check the if the game with the id exists.
 * @function
 * @param {number} id The id of the game
 * @returns {Promise<boolean>} If the game exists or not.
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

/**
 * @summary Check if a certain member is already in the game by memberId and gameId parameters.
 * @function
 * @param {number} memberId
 * @param {number} gameId
 * @returns {Promise<boolean>} If the member is already in the game.
 */
const isMemberInGame = async (memberId, gameId) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [memberId, gameId];
    const getPlayerSqlQuery = `SELECT COUNT(1) FROM PLAYERS P
    WHERE P.MEMBER_ID = :memberId AND P.GAME_ID = :gameId
    `;
    const rawPlayerResponse = await connection.execute(getPlayerSqlQuery, sqlParams);
    const playerCount = parseInt(rawPlayerResponse.rows[0]['COUNT(1)'], 10);
    return playerCount > 0;
  } finally {
    connection.close();
  }
};

const cleanTableCardsByGameId = async (gameId, connection) => {
  const sqlParams = [gameId];
  const cleanCardSqlQuery = `
  DELETE FROM TABLE_CARDS WHERE GAME_ID = :gameID
  `;
  await connection.execute(cleanCardSqlQuery, sqlParams);
};

const insertCardsByGameId = async (gameId, tableCards, connection) => {
  const flattenedArray = _.flatten(_.map(tableCards, card => (_.values(card))));
  const individualSelection = [];
  for (let i = 0; i < _.size(flattenedArray); i += 2) {
    individualSelection.push(`(:${i}, :${i+1})`);
  }
  const selectBindString = _.join(individualSelection, ',');
  const getIdSqlQuery = `
  SELECT C.CARD_ID FROM CARDS C
  INNER JOIN CARD_SUITS CS ON C.CARD_SUIT_ID = CS.SUIT_ID
  INNER JOIN CARD_NUMBERS CN ON C.CARD_NUMBER_ID = CN.CARD_NUMBER_ID
  WHERE (CN.CARD_NUMBER, CS.SUIT) IN (${selectBindString})`
  const cardIdResult = await connection.execute(getIdSqlQuery, flattenedArray);
  const cardIds = _.flatten(_.map(cardIdResult.rows, card => card.CARD_ID));

  const insertBindString = cardIds.map((name, index) => `INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (:gameId, :${index})`).join('\n');
  const insertSqlQuery = `
  INSERT ALL
    ${insertBindString}
  SELECT 1 FROM DUAL
  `
  const sqlParams = {
    ...cardIds,
    gameId
  };
  await connection.execute(insertSqlQuery, sqlParams);
};

const deleteGameByGameId = async (gameId) => {
  const connection = await conn.getConnection();
  try {
    await cleanTableCardsByGameId(gameId, connection);
    await playerDao.deletePlayersByGameId(gameId);
    const sqlParams = [gameId];
    const deleteSqlQuery = `
    DELETE FROM GAMES WHERE GAME_ID = :gameId
    `;
    const result = await connection.execute(deleteSqlQuery, sqlParams, { autoCommit: true });
    return result;
  } finally {
    connection.close();
  }
};

const databaseName = string => (decamelize(string).toUpperCase());

const isTruthyOrZero = val => (val || val === 0);

const patchGame = async (gameId, attributes) => {
  const connection = await conn.getConnection();
  try {
    attributes.id = gameId;
    const tableCards = attributes.tableCards;
    delete attributes.tableCards;
    attributes.round = attributes.round[0].toUpperCase();
    //Clean the card first, then insert the cards
    await cleanTableCardsByGameId(gameId, connection);
    await insertCardsByGameId(gameId, tableCards, connection);

    //Do other patch jobs right here
    const joinedStringArray = _.map(attributes, (value, key) => (`${isTruthyOrZero(value) ? `${databaseName(key)} = :${key}` : ''}`));
    const joinedString = _(joinedStringArray).compact().join(', ');
    const sqlQuery = `
    UPDATE GAMES
    SET ${joinedString}
    WHERE GAME_ID = :id
    `
    const filteredAttributes = _.pickBy(attributes, isTruthyOrZero);
    console.log(filteredAttributes);
    return true;
    if (_.isEmpty(filteredAttributes)) {
      //commit the change right here
      return true;
    }
    filteredAttributes.id = gameId;
    const response = await connection.execute(sqlQuery, filteredAttributes, { autoCommit: true });
    return response.rowsAffected > 0;
  } finally {
    connection.close();
  }
}

module.exports = {
  getGames,
  getGameById,
  getGamesByMemberId,
  validateGame,
  postGame,
  deleteGameByGameId,
  isMemberInGame,
  patchGame,
};
