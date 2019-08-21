const appRoot = require('app-root-path');

const gameDao = require('../../db/oracledb/game-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get game by unique ID
 * @param {object} req Reqest object.
 * @param {object} res Response object.
 */
const get = async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await gameDao.getGameById(gameId);
    if (!result) {
      errorBuilder(res, 404, 'A game with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Delete game by unique ID.
 * @param {object} req Reqest object.
 * @param {object} res Response object.
 */
const del = async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await gameDao.deleteGameByGameId(gameId);
    if (result.rowsAffected < 1) {
      errorBuilder(res, 404, 'Game with the specified Id was not found');
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Patch game by unique ID.
 * @param {object} req Reqest object.
 * @param {object} res Response object.
 */
const patch = async (req, res) => {
  try {
    const { gameId } = req.params;
    if (gameId !== req.body.data.id) {
      errorBuilder(res, 400, ['Game id in path does not match id in body.']);
    } else {
      const result = await gameDao.patchGame(gameId, req.body.data.attributes);
      if (result.rowsAffected < 1) {
        errorBuilder(res, 404, 'A game with the specified ID was not found.');
      } else {
        const updatedResult = await gameDao.getGameById(gameId);
        res.send(updatedResult);
      }
    }
  } catch (err) {
    errorHandler(res, err);
  }
};


module.exports = { get, delete: del, patch };
