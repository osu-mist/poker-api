const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');

const testData = require('./test-data');

const gameSerializer = appRoot.require('api/v1/serializers/games-serializer');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);

describe('Test games-serializer', () => {
  const {
    rawGames,
    mergedRawGames,
    serializedGames,
    serializedGame,
  } = testData;

  describe('Test mergeRawGames', () => {
    it('Should merge rawgames properly', () => {
      const result = gameSerializer.mergeRawGames(rawGames);
      chai.expect(result).to.deep.equal(mergedRawGames);
    });
  });

  describe('Test serializeGames', () => {
    it('Should serialize rawGames properly', () => {
      const result = gameSerializer.serializeGames(rawGames);
      chai.expect(result).to.deep.equal(serializedGames);
    });
  });

  describe('Test serializeGame', () => {
    it('Should serialize rawGames properly', () => {
      const result = gameSerializer.serializeGame(rawGames);
      chai.expect(result).to.deep.equal(serializedGame);
    });
  });
});
