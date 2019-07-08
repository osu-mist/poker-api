const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink } = appRoot.require('utils/uri-builder');

const playerResourceProp = openapi.definitions.PlayerResource.properties;
const playerResourceType = playerResourceProp.type.enum[0];
const playerResourceKeys = _.keys(playerResourceProp.attributes.properties);
const playerResourcePath = 'players';
const gameResourcePath = 'games';
const playerResourceUrl = resourcePathLink(apiBaseUrl, gameResourcePath);

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in openapi.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(playerResourceKeys, (key, index) => {
  playerResourceKeys[index] = decamelize(key).toUpperCase();
});
playerResourceKeys.push('playerCards');

const playerConverter = (player) => {
  player.MEMBER_LEVEL = parseInt(player.MEMBER_LEVEL, 10);
  player.MEMBER_EXP_OVER_LEVEL = parseInt(player.MEMBER_EXP_OVER_LEVEL, 10);
  player.PLAYER_BET = parseInt(player.PLAYER_BET, 10);
};

const serializePlayers = (rawPlayers, query, gameId) => {
  _.forEach(rawPlayers, (player) => {
    playerConverter(player);
  });

  const topLevelSelfLink = resourcePathLink(playerResourceUrl, `${gameId}/${playerResourcePath}`);
  const serializerArgs = {
    identifierField: 'PLAYER_ID',
    resourceKeys: playerResourceKeys,
    resourcePath: `${gameResourcePath}/${gameId}/${playerResourcePath}`,
    topLevelSelfLink,
    query,
    enableDataLinks: true,
  };
  return new JsonApiSerializer(
    playerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPlayers);
};

const serializePlayer = (rawPlayer, gameId, playerId) => {
  playerConverter(rawPlayer);

  const topLevelSelfLink = resourcePathLink(playerResourceUrl, `${gameId}/${playerResourcePath}/${playerId}`);
  const serializerArgs = {
    identifierField: 'PLAYER_ID',
    resourceKeys: playerResourceKeys,
    resourcePath: `${gameResourcePath}/${gameId}/${playerResourcePath}`,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    playerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPlayer);
};

module.exports = { serializePlayers, serializePlayer };
