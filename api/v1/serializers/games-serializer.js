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

const serializeGames = (rawGames, query) => {
  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
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
