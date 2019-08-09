const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const config = require('config');

const { createConnStub } = require('./test-util');
const testData = require('./test-data');

const playersSerializer = appRoot.require('api/v1/serializers/players-serializer');
const gamesDao = appRoot.require('api/v1/db/oracledb/game-dao');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

let playersDao;

describe('Test players-dao', () => {
  const {
    fakeId,
    testCases,
    testResult,
    fakePlayerPostBody,

  } = testData;

  const {
    onePlayerTestResult,
  } = testResult;

  const {
    emptyResult,
    onePlayerInMultiGameResult,
    onePlayerInOneGameResult,
    singleResult,
    singleResultWithOutId,
  } = testCases;

  beforeEach(() => {
    const validateGameStub = sinon.stub(gamesDao, 'validateGame').resolves(false);
    sinon.stub(config, 'get').returns({ oracledb: {} });
    const serializePlayerStub = sinon.stub(playersSerializer, 'serializePlayer');
    const serializePlayersStub = sinon.stub(playersSerializer, 'serializePlayers');
    serializePlayersStub.returnsArg(0);
    serializePlayerStub.returnsArg(0);

    playersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/player-dao`,
      {
        [`${appRoot}/api/v1/serializers/players-serializer`]: {
          serializePlayer: serializePlayerStub,
          serializePlayers: serializePlayersStub,
        },
        [`${appRoot}/api/v1/db/oracledb/game-dao`]: {
          validateGame: validateGameStub,
        },
      });
  });

  afterEach(() => sinon.restore());

  describe('Test getPlayersByGameId', () => {
    it('Should return undefined when the gameId is not validated', () => {
      createConnStub(emptyResult);
      const result = playersDao.getPlayersByGameId(fakeId);
      return result.should
        .eventually.be.fulfilled
        .and.equal(undefined);
    });
  });

  describe('Test getPlayersByGameId', () => {
    it('Should be fulfilled when there are only one player from one game result', () => {
      createConnStub(onePlayerInOneGameResult);
      const result = playersDao.getPlayerByGameIdAndPlayerId(fakeId, fakeId);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(onePlayerTestResult);
    });

    it('Should be rejected when there are multiple games of one layer in the result', () => {
      createConnStub(onePlayerInMultiGameResult);
      const result = playersDao.getPlayerByGameIdAndPlayerId(fakeId, fakeId);
      const error = 'Expect a single object but got multiple results.';
      return result.should.eventually.be.rejectedWith(Error, error);
    });

    it('Should return undefined when there are empty returns', () => {
      createConnStub(emptyResult);
      const result = playersDao.getPlayerByGameIdAndPlayerId(fakeId, fakeId);
      return result.should
        .eventually.be.fulfilled
        .and.equal(undefined);
    });
  });

  describe('Test postPlayerByGameId', () => {
    it('Improper body should be rejected', () => {
      createConnStub();

      const result = playersDao.postPlayerByGameId({});
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('Should be rejected when there are no OutId in the result field', () => {
      createConnStub(singleResult);

      const result = playersDao.postPlayerByGameId(fakePlayerPostBody);
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('Should be fulfilled with single result', () => {
      const expectedResult = [{}];
      createConnStub(singleResultWithOutId);

      const result = playersDao.postPlayerByGameId(fakePlayerPostBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult);
    });
  });
});
