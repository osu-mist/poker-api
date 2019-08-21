const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const gameResourceProp = openapi.definitions.GameResource.properties;
const gameResourceType = gameResourceProp.type.enum[0];
const gameResourceKeys = _.keys(gameResourceProp.attributes.properties);
const gameResourcePath = 'games';
const gameResourceUrl = resourcePathLink(apiBaseUrl, gameResourcePath);
const gameFromMemberResourcePath = memberId => `members/${memberId}/games`;

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in openapi.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(gameResourceKeys, (key, index) => {
  gameResourceKeys[index] = decamelize(key).toUpperCase();
});
gameResourceKeys.push('tableCards');

/**
 *
 * @param {object} rawGame The raw game object
 */
const individualGameConverter = (rawGame) => {
  rawGame.MINIMUM_BET = parseInt(rawGame.MINIMUM_BET, 10);
  rawGame.MAXIMUM_BET = parseInt(rawGame.MAXIMUM_BET, 10);
  rawGame.BET_POOL = parseInt(rawGame.BET_POOL, 10);
};

/**
 * @summary Merge the raw response from database. Extract card information from every row,
 * and put them into a field called 'tableCards' in the individual merged game object, while other
 * properties in the object remained in the first layer.
 * @function
 * @param {object[]} rawGames An array of raw game data returned from SQL database.
 * @returns {object[]} Game objects merged.
 */
const mergeRawGames = (rawGames) => {
  const groupedRawGames = _.groupBy(rawGames, 'GAME_ID');
  const mergedRawGames = _.map(groupedRawGames, (gameMetaDataArray) => {
    gameMetaDataArray[0].tableCards = gameMetaDataArray[0].CARD_NUMBER === null ? []
      : _.map(gameMetaDataArray, data => ({
        cardNumber: data.CARD_NUMBER,
        cardSuit: data.SUIT,
      }));
    return gameMetaDataArray[0];
  });
  return mergedRawGames;
};

/**
 * Serialize gameResources to JSON API
 *
 * @param {object[]} rawGames Raw data rows from data source
 * @param {object} query Query parameters
 * @param {string} memberId Id of the member, optional
 * @returns {object} Serialized gameResources object
 */
const serializeGames = (rawGames, query, memberId) => {
  rawGames = mergeRawGames(rawGames);
  _.forEach(rawGames, (game) => {
    individualGameConverter(game);
  });
  const gameResourcePathInstance = memberId ? gameFromMemberResourcePath(memberId)
    : gameResourcePath;
  const gameResourceUrlShadow = resourcePathLink(apiBaseUrl, gameResourcePathInstance);
  const topLevelSelfLink = paramsLink(gameResourceUrlShadow, query);

  const serializerArgs = {
    identifierField: 'GAME_ID',
    resourceKeys: gameResourceKeys,
    resourcePath: gameResourcePath,
    topLevelSelfLink,
    query,
    enableDataLinks: true,
  };
  return new JsonApiSerializer(
    gameResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawGames);
};

/**
 * Serialize gameResources to JSON API
 *
 * @param {object[]} rawGames Raw data rows from data source
 * @param {boolean} isPost Whether client is posting
 * @param {object} query Query parameters
 * @returns {object} Serialized gameResources object
 */
const serializeGame = (rawGames, isPost, query) => {
  const [rawGame] = mergeRawGames(rawGames);
  individualGameConverter(rawGame);
  const topLevelSelfLink = resourcePathLink(gameResourceUrl, rawGame.GAME_ID);
  const serializerArgs = {
    identifierField: 'GAME_ID',
    resourceKeys: gameResourceKeys,
    resourcePath: gameResourcePath,
    topLevelSelfLink: isPost ? gameResourceUrl : topLevelSelfLink,
    query,
    enableDataLinks: true,
  };
  return new JsonApiSerializer(
    gameResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawGame);
};

module.exports = {
  serializeGames, serializeGame, mergeRawGames, individualGameConverter,
};
