const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeGames, serializeGame } = require('../../serializers/games-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const mergeRawGames = (rawGames) => {
  const mergedRawGames = [];
  let currentId = 'dummy';
  for (let i = 0; i < rawGames.length; i += 1) {
    if (rawGames[i].GAME_ID !== currentId) {
      currentId = rawGames[i].GAME_ID;
      rawGames[i].tableCards = [{
        cardNumber: rawGames[i].CARD_NUMBER,
        cardSuit: rawGames[i].SUIT,
      }];
      mergedRawGames.push(rawGames[i]);
    } else {
      mergedRawGames[mergedRawGames.length - 1].tableCards.push({
        cardNumber: rawGames[i].CARD_NUMBER,
        cardSuit: rawGames[i].SUIT,
      });
    }
  }
  return mergedRawGames;
};

const getGames = async (query) => {
  const connection = await conn.getConnection();
  const roundId = query ? query.roundId : null;

  try {
    const sqlParams = {};
    if (roundId) {
      sqlParams.roundId = roundId;
    }
    const sqlQuery = `
    SELECT CARD_NUMBERS.CARD_NUMBER, CARD_SUITS.SUIT, GAMES.GAME_ID, ROUNDS.ROUND, GAMES.MAXIMUM_BET, 
    GAMES.MINIMUM_BET, GAMES.BET_POOL 
    FROM TABLE_CARDS, GAMES, CARDS, CARD_SUITS, CARD_NUMBERS, ROUNDS 
    WHERE GAMES.GAME_ID = TABLE_CARDS.GAME_ID AND 
    TABLE_CARDS.GAME_ID = GAMES.GAME_ID AND 
    TABLE_CARDS.CARD_ID = CARDS.CARD_ID AND
    CARDS.CARD_NUMBER_ID = CARD_NUMBERS.CARD_NUMBER_ID AND 
    CARDS.CARD_SUIT_ID = CARD_SUITS.SUIT_ID AND 
    GAMES.ROUND_ID = ROUNDS.ROUND_ID
    ${roundId ? 'AND ROUND_ID = :roundId' : ''}
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

const getGamesByMemberId = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = [id];
    const sqlQuery = `
    SELECT CARD_NUMBERS.CARD_NUMBER, CARD_SUITS.SUIT, GAMES.GAME_ID, ROUNDS.ROUND, GAMES.MAXIMUM_BET, 
    GAMES.MINIMUM_BET, GAMES.BET_POOL 
    FROM TABLE_CARDS, GAMES, CARDS, CARD_SUITS, CARD_NUMBERS, ROUNDS, PLAYERS
    WHERE GAMES.GAME_ID = TABLE_CARDS.GAME_ID AND 
    TABLE_CARDS.GAME_ID = GAMES.GAME_ID AND 
    TABLE_CARDS.CARD_ID = CARDS.CARD_ID AND
    CARDS.CARD_NUMBER_ID = CARD_NUMBERS.CARD_NUMBER_ID AND 
    CARDS.CARD_SUIT_ID = CARD_SUITS.SUIT_ID AND 
    GAMES.ROUND_ID = ROUNDS.ROUND_ID AND 
    PLAYERS.MEMBER_ID = :id AND 
    PLAYERS.GAME_ID = GAMES.GAME_ID
    `;
    const rawGamesResponse = await connection.execute(sqlQuery, sqlParams);
    let rawGames = rawGamesResponse.rows;
    rawGames = mergeRawGames(rawGames);
    console.log(rawGames);
    const serializedGames = serializeGames(rawGames);
    return serializedGames;
  } finally {
    connection.close();
  }
};

const getGameById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlQuery = `
    SELECT CARD_NUMBERS.CARD_NUMBER, CARD_SUITS.SUIT, GAMES.GAME_ID, ROUNDS.ROUND, GAMES.MAXIMUM_BET, 
    GAMES.MINIMUM_BET, GAMES.BET_POOL 
    FROM TABLE_CARDS, GAMES, CARDS, CARD_SUITS, CARD_NUMBERS, ROUNDS 
    WHERE GAMES.GAME_ID = TABLE_CARDS.GAME_ID AND 
    TABLE_CARDS.GAME_ID = GAMES.GAME_ID AND 
    TABLE_CARDS.CARD_ID = CARDS.CARD_ID AND
    CARDS.CARD_NUMBER_ID = CARD_NUMBERS.CARD_NUMBER_ID AND 
    CARDS.CARD_SUIT_ID = CARD_SUITS.SUIT_ID AND 
    GAMES.ROUND_ID = ROUNDS.ROUND_ID AND 
    GAMES.GAME_ID = :id
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
      const serializedGame = serializeGame(rawGames);
      return serializedGame;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getGames, getGameById, getGamesByMemberId };
