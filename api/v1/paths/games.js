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
    if (memberDao.hasDuplicateMemberId(req.body.data.attributes.memberIds)) {
      errorBuilder(res, 400, ['Contains duplicate memberId.']);
    } else if (!(await memberDao.validateMembers(req.body.data.attributes.memberIds))) {
      errorBuilder(res, 400, ['One or more memberId in memberIds field does not exist.']);
    } else {
      const result = await gamesDao.postGame(req.body);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games'].get;
post.apiDoc = paths['/games'].post;

module.exports = { get, post };
