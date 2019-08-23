const appRoot = require('app-root-path');

const gameDao = require('../../../db/oracledb/game-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get games a specific member is now playing
 * @param {object} req Request object
 * @param {object} res Response object
 */
const get = async (req, res) => {
  try {
    const { memberId } = req.params;
    const result = await gameDao.getGamesByMemberId(memberId, req.query);
    if (!result) {
      errorBuilder(res, 404, 'A member with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};


module.exports = { get };
