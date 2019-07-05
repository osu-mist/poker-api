const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const playerResourceProp = openapi.definitions.PlayerResource.properties;
const playerResourceType = playerResourceProp.type.enum[0];
const playerResourceKeys = _.keys(playerResourceProp.attributes.properties);
const playerResourcePath = 'players';
const playerResourceUrl = resourcePathLink(apiBaseUrl, playerResourcePath);

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in openapi.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(playerResourceKeys, (key, index) => {
    playerResourceKeys[index] = decamelize(key).toUpperCase();
});

const playerConverter = (rawPlayers) => {
    _.forEach(rawPlayers, (player) => {
      player.MEMBER_LEVEL = parseInt(player.MEMBER_LEVEL, 10);
      player.MEMBER_EXP_OVER_LEVEL = parseInt(player.MEMBER_EXP_OVER_LEVEL, 10);
      player.PLAYER_BET = parseInt(player.PLAYER_BET, 10);
    });
  };

const serializePlayers = (rawPlayers, query) => {
    /**
     * Add pagination links and meta information to options if pagination is enabled
     */
    playerConverter(rawPlayers);
  
    const topLevelSelfLink = paramsLink(playerResourceUrl, query);
    const serializerArgs = {
      identifierField: 'PLAYER_ID',
      resourceKeys: playerResourceKeys,
      resourcePath: playerResourcePath,
      topLevelSelfLink,
      query,
      enableDataLinks: true,
    };
    return new JsonApiSerializer(
      playerResourceType,
      serializerOptions(serializerArgs),
    ).serialize(rawPlayers);
  };

  module.exports = { serializePlayers };