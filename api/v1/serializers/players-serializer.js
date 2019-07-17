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
const playerResourcePath = gameId => `games/${gameId}/players`;


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

const mergeRawPlayers = (rawPlayers) => {
  const groupedRawPlayers = _.groupBy(rawPlayers, 'PLAYER_ID');
  const mergedRawPlayers = _.map(groupedRawPlayers, (playerMetaDataArray) => {
    playerMetaDataArray[0].playerCards = playerMetaDataArray[0].CARD_NUMBER === null ? []
      : _.map(playerMetaDataArray, data => ({
        cardNumber: data.CARD_NUMBER,
        cardSuit: data.SUIT,
      }));
    return playerMetaDataArray[0];
  });
  return mergedRawPlayers;
};

const serializePlayers = (rawPlayers, query, gameId) => {
  rawPlayers = mergeRawPlayers(rawPlayers);
  _.forEach(rawPlayers, (player) => {
    playerConverter(player);
  });
  const playerResourcePathInstance = playerResourcePath(gameId);
  const playerResourceUrl = resourcePathLink(apiBaseUrl, playerResourcePathInstance);
  const topLevelSelfLink = paramsLink(playerResourceUrl, query);
  const serializerArgs = {
    identifierField: 'PLAYER_ID',
    resourceKeys: playerResourceKeys,
    resourcePath: playerResourcePathInstance,
    topLevelSelfLink,
    query,
    enableDataLinks: true,
  };
  return new JsonApiSerializer(
    playerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPlayers);
};

const serializePlayer = (rawPlayers, gameId, isPost = false) => {
  const [rawPlayer] = mergeRawPlayers(rawPlayers);
  playerConverter(rawPlayer);
  const playerId = rawPlayer.PLAYER_ID;
  const playerResourcePathInstance = playerResourcePath(gameId);
  const playerResourceUrl = resourcePathLink(apiBaseUrl, playerResourcePathInstance);
  const topLevelSelfLink = isPost ? playerResourceUrl
    : resourcePathLink(playerResourceUrl, playerId);
  const serializerArgs = {
    identifierField: 'PLAYER_ID',
    resourceKeys: playerResourceKeys,
    resourcePath: playerResourcePathInstance,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    playerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPlayer);
};

module.exports = { serializePlayers, serializePlayer };
