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

const gameConverter = (rawGames) => {
  _.forEach(rawGames, (game) => {
    game.MINIMUM_BET = parseInt(game.MINIMUM_BET, 10);
    game.MAXIMUM_BET = parseInt(game.MAXIMUM_BET, 10);
    game.BET_POOL = parseInt(game.BET_POOL, 10);
  });
};

/**
 * @summary Merge the raw response from database. Extract card information from every row,
 * and put them into a field called 'tableCards' in the individual merged game object, while other
 * properties in the object remained in the first layer.
 * @function
 * @param {Array[Object]} rawGames An array of raw game data returned from SQL database.
 * @returns {Array[Object]} Game objects merged.
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

const serializeGames = (rawGames, query) => {
  rawGames = mergeRawGames(rawGames);
  gameConverter(rawGames);

  const topLevelSelfLink = paramsLink(gameResourceUrl, query);
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

module.exports = { serializeGames };
