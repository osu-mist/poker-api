const appRoot = require('app-root-path');

const gamesDao = require('../db/oracledb/game-dao');
const memberDao = require('../db/oracledb/member-dao');

const { errorHandler, errorBuilder } = appRoot.require('errors/errors');

/**
 * @summary Get games
 * @param {object} req The request object sent from client.
 * @param {object} res The response object sent to client.
 * @returns {object} Response or error.
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
 * @param {object} req The request object sent from client.
 * @param {object} res The response object sent to client.
 */
const post = async (req, res) => {
  try {
    if (memberDao.hasDuplicateMemberId(req.body.data.attributes.memberIds)) {
      errorBuilder(res, 400, ['Contains duplicate memberId.']);
    } else if (!(await memberDao.validateMembers(req.body.data.attributes.memberIds))) {
      errorBuilder(res, 400, ['One or more memberId in memberIds field does not exist.']);
    } else {
      const result = await gamesDao.postGame(req.body);
      res.set('Location', result.data.links.self);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};


module.exports = { get, post };
