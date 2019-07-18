const appRoot = require('app-root-path');

const playerDao = require('../../../db/oracledb/player-dao');
const gameDao = require('../../../db/oracledb/game-dao');
const memberDao = require('../../../db/oracledb/member-dao');

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
    const { gameId } = req.params;
    const { memberId } = req.body.data.attributes;
    const isGameValid = await gameDao.validateGame(gameId);
    if (!isGameValid) {
      errorBuilder(res, 404, 'The game with the specified ID was not found.');
    } else if (!(await memberDao.validateMembers([memberId]))) {
      errorBuilder(res, 400, ['The member with the memberId in the body does not exist.']);
    } else if (await gameDao.isMemberInGame(memberId, gameId)) {
      errorBuilder(res, 400, ['The member is already in the game.']);
    } else {
      const result = await playerDao.postPlayerByGameId(req.body.data.attributes, gameId);
      res.set('Location', result.data.links.self);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games/{gameId}/players'].get;
post.apiDoc = paths['/games/{gameId}/players'].post;

module.exports = { get, post };
