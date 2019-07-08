const appRoot = require('app-root-path');

const playerDao = require('../../../../db/oracledb/player-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get games a specific member is now playing
 */
const get = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.params;
    const result = await playerDao.getPlayersByGameIdAndPlayerId(gameId, playerId);
    if (!result) {
      errorBuilder(res, 404, 'A game / player with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games/{gameId}/players/{playerId}'].get;

module.exports = { get };
