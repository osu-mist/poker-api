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
    fakeGamePatchBody,
  } = testData;
  const {
    emptyResult, multiResult, singleResult,
    rowEffectedOneResult,
    multiGameResult,
    singleResultWithOutId,
    rowEffectZeroResult,
  } = testCases;

  beforeEach(() => {
    const serializeGamesStub = sinon.stub(gamesSerializer, 'serializeGames');
    const serializeGameStub = sinon.stub(gamesSerializer, 'serializeGame');
    serializeGamesStub.returnsArg(0);
    serializeGameStub.returnsArg(0);

    gamesDao = proxyquire(`${appRoot}/api/v1/db/oracledb/game-dao`,
      {
        [`${appRoot}/api/v1/serializers/games-serializer`]: {
          serializeGame: serializeGameStub,
          serializeGames: serializeGamesStub,
        },
      });
  });

  afterEach(() => sinon.restore());

  describe('Test getGames', () => {
    const validTestCases = [
      emptyResult,
      multiResult,
      singleResult,
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
      emptyResult,
      singleResult,
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
      const testCase = multiGameResult;
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
      createConnStub(singleResult);

      const result = gamesDao.postGame(fakeGamePostBody);
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('Should be fulfilled with single result', () => {
      const expectedResult = [{}];
      createConnStub(singleResultWithOutId);

      const result = gamesDao.postGame(fakeGamePostBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult);
    });
  });


  describe('Testing COUNT(1) related functions.', () => {
    const countOneFunctions = [
      'validateGame',
      'getGamesByMemberId',
      'isMemberInGame',
    ];
    _.forEach(countOneFunctions, (fun) => {
      describe(`Test ${fun.name}`, () => {
        it('The function should be rejected when the database response does not contain COUNT(1) field', () => {
          const testCase = emptyResult;
          const error = 'Cannot read property \'COUNT(1)\' of undefined';

          createConnStub(testCase);
          const result = gamesDao[fun](fakeId);
          sinon.restore();
          return result.should.eventually.be.rejectedWith(TypeError, error);
        });
      });
    });
  });

  describe('Test deleteGameById', () => {
    const validTestCases = [
      singleResult,
      emptyResult,
    ];
    _.forEach(validTestCases, (testCase) => {
      it(`deleteGameById should be fulfilled with ${testCase.description}`, () => {
        createConnStub(testCase);

        const expectedResult = testCase.data;
        const result = gamesDao.deleteGameByGameId(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test patchGame', () => {
    const validFalseTestCases = [
      singleResult,
      emptyResult,
      rowEffectZeroResult,
    ];

    it('Empty body should be fulfilled while the execute function from conn object is not called at all', () => {
      const connStub = createConnStub();

      const result = gamesDao.patchGame(fakeId, {});
      return result.should
        .eventually.be.fulfilled
        .and.equal(true)
        .then(() => {
          sinon.assert.notCalled(connStub.executeStub);
        });
    });

    _.forEach(validFalseTestCases, (testCase) => {
      it(`should be fulfilled with ${testCase.description} and return false`, () => {
        createConnStub(testCase);

        const expectedResult = false;
        const result = gamesDao.patchGame(fakeId, fakeGamePatchBody);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });

    it('patchMember should be fulfilled with one row effected result and return true', () => {
      createConnStub(rowEffectedOneResult);

      const expectedResult = true;
      const result = gamesDao.patchGame(fakeId, fakeGamePatchBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult);
    });
  });
});
