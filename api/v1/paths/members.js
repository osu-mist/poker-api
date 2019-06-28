const appRoot = require('app-root-path');

const membersDao = require('../db/oracledb/member-dao');

const { errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get members
 */
const get = async (req, res) => {
  try {
    const result = await membersDao.getMembers(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/members'].get;

module.exports = { get };
