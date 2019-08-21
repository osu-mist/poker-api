const appRoot = require('app-root-path');

const playerDao = require('../../../../db/oracledb/player-dao');
const gameDao = require('../../../../db/oracledb/game-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get the information of a player inside the game with the gameId and playerId.
 * @param {object} req Request object
 * @param {object} res Response object
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

/**
 * @summary Delete player by unique ID.
 * @param {object} req Request object
 * @param {object} res Response object
 */
const del = async (req, res) => {
  try {
    const { playerId, gameId } = req.params;
    const isGameValid = await gameDao.validateGame(gameId);
    if (!isGameValid) {
      errorBuilder(res, 404, 'The game with the specified game ID is not found');
    } else {
      const result = await playerDao.deletePlayerByPlayerId(playerId);
      if (result.rowsAffected < 1) {
        errorBuilder(res, 404, 'Player with the specified Id was not found');
      } else {
        res.sendStatus(204);
      }
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @param {object} req Request object
 * @param {object} res Response object
 */
const patch = async (req, res) => {
  try {
    const { gameId, playerId } = req.params;
    if (playerId !== req.body.data.id) {
      errorBuilder(res, 400, ['Player id in path does not match id in body.']);
    } else {
      const result = await playerDao.patchPlayer(playerId, req.body.data.attributes);
      if (!result) {
        errorBuilder(res, 404, 'A player with the specified ID was not found.');
      } else {
        const updatedResult = await playerDao.getPlayerByGameIdAndPlayerId(gameId, playerId);
        res.send(updatedResult);
      }
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

module.exports = { get, del, patch };
