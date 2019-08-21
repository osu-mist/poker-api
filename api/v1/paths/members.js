const appRoot = require('app-root-path');

const membersDao = require('../db/oracledb/member-dao');

const { errorHandler, errorBuilder } = appRoot.require('errors/errors');

/**
 * @summary Get members
 * @param {object} req The request object sent from client.
 * @param {object} res The response object sent to client.
 * @returns {object} Response or error.
 */
const get = async (req, res) => {
  try {
    const result = await membersDao.getMembers(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Post member
 * @param {object} req The request object sent from client.
 * @param {object} res The response object sent to client.
 */
const post = async (req, res) => {
  try {
    const { memberNickname, memberEmail } = req.body.data.attributes;
    if (await membersDao.isMemberAlreadyRegistered(memberNickname, memberEmail)) {
      errorBuilder(res, 400, ['Member nickname or member email have already been used.']);
    } else {
      const result = await membersDao.postMember(req.body);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};


module.exports = { get, post };
