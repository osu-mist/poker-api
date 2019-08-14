const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');

const testData = require('./test-data');

const playerSerializer = appRoot.require('api/v1/serializers/players-serializer');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);

describe('Test players-serializer', () => {
  const {
    rawPlayer,
    mergedRawPlayer,
    rawPlayers,
    serializedPlayers,
    testGameId,
    serializedPlayer,
    // serializedGames,
    // serializedGame,
  } = testData;
  const query = {};
  describe('Test mergeRawPlayers', () => {
    it('Should merge rawPlayer properly', () => {
      const result = playerSerializer.mergeRawPlayers(rawPlayer);
      chai.expect(result).to.deep.equal(mergedRawPlayer);
    });
  });

  describe('Test serializePlayers', () => {
    it('Should serialize rawPlayers properly', () => {
      const result = playerSerializer.serializePlayers(rawPlayers, query, testGameId);
      chai.expect(result).to.deep.equal(serializedPlayers);
    });
  });

  describe('Test serializePlayer', () => {
    it('Should serialize rawPlayer properly', () => {
      const result = playerSerializer.serializePlayer(rawPlayer, testGameId);
      chai.expect(result).to.deep.equal(serializedPlayer);
    });
  });
});
