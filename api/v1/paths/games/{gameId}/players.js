const appRoot = require('app-root-path');

const playerDao = require('../../../db/oracledb/player-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get games a specific member is now playing
 */
const get = async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await playerDao.getPlayersByGameId(gameId);
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
 * @summary Post player in game
 */
const post = async (req, res) => {
  try {
    if (memberDao.hasDuplicateMemberId(req.body)) {
      errorBuilder(res, 400, ['Contains duplicate memberId.']);
    } else if (!(await memberDao.validateMembers(req.body))) {
      errorBuilder(res, 400, ['One or more memberId in memberIds field does not exist.']);
    } else {
      const result = await gamesDao.postGame(req.body);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games/{gameId}/players'].get;
post.apiDoc = paths['/games/{gameId}/players'].post;

module.exports = { get, post };
