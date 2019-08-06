const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { createConnStub } = require('./test-util');
const testData = require('./test-data');


const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

let gamesDao;

describe('Test games-dao', () => {
  const {
    fakeId,
    testCases,
    fakeGamePostBody,
  } = testData;

  beforeEach(() => {
    const gamesSerializerStub = sinon.stub(gamesSerializer, 'serializeGames');
    const gameSerializerStub = sinon.stub(gamesSerializer, 'serializeGame');
    gamesSerializerStub.returnsArg(0);
    gameSerializerStub.returnsArg(0);

    gamesDao = proxyquire(`${appRoot}/api/v1/db/oracledb/game-dao`,
      {
        [`${appRoot}/api/v1/serializers/games-serializer`]: {
          serializeGame: gameSerializerStub,
          serializeGames: gamesSerializerStub,
        },
      });
  });

  afterEach(() => sinon.restore());

  describe('Test getGames', () => {
    const validTestCases = [
      testCases.emptyResult,
      testCases.multiResult,
      testCases.singleResult,
    ];
    _.forEach(validTestCases, (testCase) => {
      it(`getGames should be fulfilled with ${testCase.description}`, () => {
        createConnStub(testCase);

        const expectedResult = testCase.data.rows;
        const result = gamesDao.getGames();
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test getGameById', () => {
    const validTestCases = [
      testCases.emptyResult,
      testCases.singleResult,
    ];
    _.forEach(validTestCases, (testCase) => {
      it(`getGameById should be fulfilled with ${testCase.description}`, () => {
        createConnStub(testCase);

        const expectedResult = testCase.data.rows[0] ? testCase.data.rows : undefined;
        const result = gamesDao.getGameById(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });

    it('getGameById should reject with multiple results', () => {
      const testCase = testCases.multiGameResult;

      const error = 'Expect a single object but got multiple results.';

      createConnStub(testCase);

      const result = gamesDao.getGameById(fakeId);
      return result.should.eventually.be.rejectedWith(Error, error);
    });
  });

  describe('Test postGame', () => {
    it('Improper body should be rejected', () => {
      createConnStub();

      const result = gamesDao.postGame({});
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('Should be rejected when there are no OutId in the result field', () => {
      createConnStub(testCases.singleResult);

      const result = gamesDao.postGame(fakeGamePostBody);
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('Should be fulfilled with single result', () => {
      const expectedResult = [{}];
      createConnStub(testCases.singleResultWithOutId);

      const result = gamesDao.postGame(fakeGamePostBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult);
    });
  });

  describe('Test validateGame', () => {

  });

  describe('Test getGamesByMemberId', () => {

  });

  describe('Test isMemberInGame', () => {

  });

  describe('Test cleanTableCardsById', () => {

  });

  describe('Test insertCardsByGameId', () => {

  });

  describe('Test deleteGameById', () => {

  });

  describe('Test databaseName', () => {

  });

  describe('Test patchGame', () => {

  });
});
