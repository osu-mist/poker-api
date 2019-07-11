const appRoot = require('app-root-path');

const gamesDao = require('../db/oracledb/game-dao');
const memberDao = require('../db/oracledb/member-dao');

const { errorHandler, errorBuilder } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get games
 */
const get = async (req, res) => {
  try {
    const result = await gamesDao.getGames(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Post game
 */
const post = async (req, res) => {
  try {
    const { gameId } = req.params;
    const isGameValid = await gamesDao.validateGame(gameId);
    if(!isGameValid){
      errorBuilder(res, 404, 'The game with the specified game ID is not found.');
    } else {
      const result = await playerDao.postPlayerByGameId(req.body,gameId);
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games'].get;
post.apiDoc = paths['/games'].post;

module.exports = { get, post };
