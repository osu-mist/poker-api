const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { createConnStub } = require('./test-util');
const testData = require('./test-data');


const playersSerializer = appRoot.require('api/v1/serializers/players-serializer');
const gamesDao = appRoot.require('api/v1/db/oracledb/player-dao');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

let playersDao;

describe('Test players-dao', () => {
  const {
    fakeId,
    testCases,
  } = testData;

  beforeEach(() => {
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
      });
  });

  afterEach(() => sinon.restore());

  describe('Test getPlayersByGameId', () => {
    it('Should return undefined when the gameId is not validated', () => {
      sinon.stub(gamesDao, 'validateGame').resolves(true);
      const result = playerDao.getPlayersByGameId(fakeId);
      return result.should;
    });
  });
});
