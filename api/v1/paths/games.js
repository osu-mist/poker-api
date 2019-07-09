const appRoot = require('app-root-path');

const gamesDao = require('../db/oracledb/game-dao');

const { errorHandler } = appRoot.require('errors/errors');
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
    const result = await gamesDao.postGame(req.body);
    return res.status(201).send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/games'].get;
post.apiDoc = paths['/games'].post;

module.exports = { get, post };
