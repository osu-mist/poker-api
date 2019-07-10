const appRoot = require('app-root-path');

const playerDao = require('../../../../db/oracledb/player-dao');
const gameDao = require('../../../../db/oracledb/game-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get the information of a player inside the game with the gameId and playerId.
 */
const get = async (req, res) => {
  try {
    const { gameId, playerId } = req.params;
    const isGameValid = await gameDao.validateGame(gameId);
    if (!isGameValid) {
      errorBuilder(res, 404, 'The game with the specified game ID is not found.');
    } else {
      const result = await playerDao.getPlayerByGameIdAndPlayerId(gameId, playerId);
      if (!result) {
        errorBuilder(res, 404, 'The player with the specified ID was not found.');
      } else {
        res.send(result);
      }
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games/{gameId}/players/{playerId}'].get;

module.exports = { get };
