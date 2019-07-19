const appRoot = require('app-root-path');

const membersDao = require('../../db/oracledb/member-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get member by unique ID
 */
const get = async (req, res) => {
  try {
    const { memberId } = req.params;
    const result = await membersDao.getMemberById(memberId);
    if (!result) {
      errorBuilder(res, 404, 'A member with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Delete member by unique ID.
 */
const del = async (req, res) => {
  try {
    const { memberId } = req.params;
    const result = await membersDao.deleteMember(memberId);
    if (result.rowsAffected < 1) {
      errorBuilder(res, 404, 'A member with the specified Id was not found');
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Patch member by unique id
 */
const patch = async (req, res) => {
  try {
    const { memberId } = req.params;
    if (memberId !== req.body.data.id) {
      errorBuilder(res, 400, ['Member id in path does not match id in the body.']);
    } else {
      const result = await membersDao.patchMember(memberId, req.body);
      if(result.rowsAffected < 1) {
        errorBuilder(res, 404, 'A member with the Id was not found.');
      } else {
        const updatedResult = await membersDao.getMemberById(memberId);
        res.send(updatedResult);
      }
    }
  } catch (err) {
    errorHandler(res, err);
  }
}

get.apiDoc = paths['/members/{memberId}'].get;
del.apiDoc = paths['/members/{memberId}'].del;
patch.apiDoc = paths['/members/{mamberId}'].patch;

module.exports = { get, del, patch };
