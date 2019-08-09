const databaseNameTestData = [
  {
    param: 'abc',
    result: 'ABC',
  },
  {
    param: 'abcDef',
    result: 'ABC_DEF',
  },
  {
    param: 'abcDefJsk',
    result: 'ABC_DEF_JSK',
  },
  {
    param: 'ABCHH',
    result: 'ABCHH',
  },
  {
    param: 'AbChC',
    result: 'AB_CH_C',
  },
];

const falseyList = [
  false,
  '',
  null,
  undefined,
  NaN,
];

const testCases = {
  singleResult: {
    data: {
      rows: [{}],
    },
    description: 'single result',
  },
  singleResultWithOutId: {
    data: {
      rows: [{}],
      outBinds: {
        outId: [1],
      },
    },
    description: 'single result with OutId',
  },
  multiResult: {
    data: {
      rows: [{}, {}],
      outBinds: {
        outId: [1],
      },
    },
    description: 'multiple result',
  },
  multiGameResult: {
    data: {
      rows: [{
        GAME_ID: 1,
      }, {
        GAME_ID: 2,
      }],
    },
  },
  playersInOneGameResult: {
    data: {
      rows: [{
        PLAYER_ID: 1,
        GAME_ID: 1,
      }, {
        PLAYER_ID: 2,
        GAME_ID: 1,
      }],
    },
    description: 'multiple players in one game result.',
  },
  onePlayerInOneGameResult: {
    data: {
      rows: [{
        PLAYER_ID: 1,
        GAME_ID: 1,
      }],
    },
    description: 'one player in one game result.',
  },
  onePlayerInMultiGameResult: {
    data: {
      rows: [{
        PLAYER_ID: 1,
        GAME_ID: 1,
      },
      {
        PLAYER_ID: 1,
        GAME_ID: 2,
      }],
    },
    description: 'one player in multiple game result.',
  },
  playersInMultiGameResult: {
    data: {
      rows: [{
        PLAYER_ID: 1,
        GAME_ID: 1,
      }, {
        PLAYER_ID: 2,
        GAME_ID: 1,
      },
      {
        PLAYER_ID: 1,
        GAME_ID: 2,
      },
      {
        PLAYER_ID: 3,
        GAME_ID: 3,
      },
      {
        PLAYER_ID: 4,
        GAME_ID: 3,
      },
      ],
    },
  },
  emptyResult: {
    data: {
      rows: [],
    },
    description: 'empty result',
  },
  rowEffectedOneResult: {
    data: {
      rowsAffected: 1,
    },
    description: 'One row affected.',
  },
  rowEffectZeroResult: {
    data: {
      rowsAffected: 0,
    },
    description: 'No row affected.',
  },
};

const fakeId = 'fakeId';
const fakeBaseUrl = 'v1';
const fakeName = 'Sam';
const fakeEmail = 'sam123@gmail.com';
const fakeMemberPostBody = {
  data: {
    type: 'member',
    attributes: {
      memberNickname: 'Jack',
      memberEmail: 'abc@efg.com',
      memberPassword: 'hunter2',
    },
  },
};
const fakeGamePostBody = {
  data: {
    id: 'string',
    type: 'game',
    attributes: {
      round: 'blind',
      minimumBet: 1000,
      maximumBet: 2000,
      betPool: 0,
      tableCards: [
        {
          cardNumber: 'A',
          cardSuit: 'diamonds',
        },
      ],
    },
  },
};
const fakeGamePatchBody = {
  data: {
    id: 'string',
    type: 'game',
    attributes: {
      round: 'blind',
      minimumBet: 1000,
      maximumBet: 2000,
      betPool: 0,
      tableCards: [
        {
          cardNumber: 'A',
          cardSuit: 'diamonds',
        },
      ],
    },
  },
};
const fakeMemberPatchBody = {
  data: {
    id: 101,
    type: 'member',
    attributes: {
      memberNickname: 'Jack',
      memberEmail: 'abc@efg.com',
      memberPassword: 'hunter2',
      memberLevel: 20,
      memberExpOverLevel: 1234,
    },
  },
};
const rawMembers = [{
  MEMBER_ID: '1',
  MEMBER_NICKNAME: 'J',
  MEMBER_EMAIL: 'abc@efg.com',
  MEMBER_LEVEL: '20',
  MEMBER_EXP_OVER_LEVEL: '0',
},
{
  MEMBER_ID: '2',
  MEMBER_NICKNAME: 'John Wick',
  MEMBER_EMAIL: 'wickj@oregonstate.edu',
  MEMBER_LEVEL: '200',
  MEMBER_EXP_OVER_LEVEL: '114514',
},
{
  MEMBER_ID: '3',
  MEMBER_NICKNAME: 'patchedNickname',
  MEMBER_EMAIL: 'patchedEmail@gmail.com',
  MEMBER_LEVEL: '2',
  MEMBER_EXP_OVER_LEVEL: '0',
}];
const rawGames = [{
  CARD_NUMBER: '2',
  SUIT: 'spades',
  GAME_ID: '1',
  ROUND: 'blind',
  MAXIMUM_BET: '200',
  MINIMUM_BET: '100',
  BET_POOL: '1000',
},
{
  CARD_NUMBER: '8',
  SUIT: 'diamonds',
  GAME_ID: '2',
  ROUND: 'river',
  MAXIMUM_BET: '2000',
  MINIMUM_BET: '1000',
  BET_POOL: '104000',
},
{
  CARD_NUMBER: '9',
  SUIT: 'diamonds',
  GAME_ID: '2',
  ROUND: 'river',
  MAXIMUM_BET: '2000',
  MINIMUM_BET: '1000',
  BET_POOL: '104000',
},
{
  CARD_NUMBER: '10',
  SUIT: 'diamonds',
  GAME_ID: '2',
  ROUND: 'river',
  MAXIMUM_BET: '2000',
  MINIMUM_BET: '1000',
  BET_POOL: '104000',
},
{
  CARD_NUMBER: 'J',
  SUIT: 'diamonds',
  GAME_ID: '2',
  ROUND: 'river',
  MAXIMUM_BET: '2000',
  MINIMUM_BET: '1000',
  BET_POOL: '104000',
},
{
  CARD_NUMBER: 'Q',
  SUIT: 'diamonds',
  GAME_ID: '2',
  ROUND: 'river',
  MAXIMUM_BET: '2000',
  MINIMUM_BET: '1000',
  BET_POOL: '104000',
},
{
  CARD_NUMBER: null,
  SUIT: null,
  GAME_ID: '3',
  ROUND: 'river',
  MAXIMUM_BET: '20000',
  MINIMUM_BET: '10000',
  BET_POOL: '1040000',
}];

const mergedRawGames = [{
  CARD_NUMBER: '2',
  SUIT: 'spades',
  GAME_ID: '1',
  ROUND: 'blind',
  MAXIMUM_BET: '200',
  MINIMUM_BET: '100',
  BET_POOL: '1000',
  tableCards: [{ cardNumber: '2', cardSuit: 'spades' }],
},
{
  CARD_NUMBER: '8',
  SUIT: 'diamonds',
  GAME_ID: '2',
  ROUND: 'river',
  MAXIMUM_BET: '2000',
  MINIMUM_BET: '1000',
  BET_POOL: '104000',
  tableCards:
 [{ cardNumber: '8', cardSuit: 'diamonds' },
   { cardNumber: '9', cardSuit: 'diamonds' },
   { cardNumber: '10', cardSuit: 'diamonds' },
   { cardNumber: 'J', cardSuit: 'diamonds' },
   { cardNumber: 'Q', cardSuit: 'diamonds' }],
},
{
  CARD_NUMBER: null,
  SUIT: null,
  GAME_ID: '3',
  ROUND: 'river',
  MAXIMUM_BET: '20000',
  MINIMUM_BET: '10000',
  BET_POOL: '1040000',
  tableCards: [],
}];

const serializedGames = {
  links: { self: '/v1/games' },
  data:
 [{
   type: 'game',
   id: '1',
   links: { self: '/v1/games/1' },
   attributes:
      {
        round: 'blind',
        minimumBet: 100,
        maximumBet: 200,
        betPool: 1000,
        tableCards: [{ cardNumber: '2', cardSuit: 'spades' }],
      },
 },
 {
   type: 'game',
   id: '2',
   links: { self: '/v1/games/2' },
   attributes:
      {
        round: 'river',
        minimumBet: 1000,
        maximumBet: 2000,
        betPool: 104000,
        tableCards:
         [{ cardNumber: '8', cardSuit: 'diamonds' },
           { cardNumber: '9', cardSuit: 'diamonds' },
           { cardNumber: '10', cardSuit: 'diamonds' },
           { cardNumber: 'J', cardSuit: 'diamonds' },
           { cardNumber: 'Q', cardSuit: 'diamonds' }],
      },
 },
 {
   type: 'game',
   id: '3',
   links: { self: '/v1/games/3' },
   attributes:
      {
        round: 'river',
        minimumBet: 10000,
        maximumBet: 20000,
        betPool: 1040000,
        tableCards: [],
      },
 }],
};
const serializedGame = {
  links: { self: '/v1/games/1' },
  data:
 {
   type: 'game',
   id: '1',
   links: { self: '/v1/games/1' },
   attributes:
    {
      round: 'blind',
      minimumBet: 100,
      maximumBet: 200,
      betPool: 1000,
      tableCards: [{ cardNumber: '2', cardSuit: 'spades' }],
    },
 },
};
const fakeMemberQuery = {
  memberNickname: 'J',
  memberEmail: 'abc@efg.com',
};
const truthyList = [
  0,
  1,
  'a',
  'abc',
  '0',
  'false',
  [],
  [1, 2, 3],
  {
    a: 'b',
  },
  {},
  () => {},
];

const testResult = {
  onePlayerTestResult:
    [
      {
        PLAYER_ID: 1,
        GAME_ID: 1,
      },
    ],
};
const fakePlayerPatchBody = {
  data: {
    id: 'g1m1',
    type: 'player',
    attributes: {
      playerBet: 0,
      playerStatus: 'folded',
      playerCards: [
        {
          cardNumber: 'A',
          cardSuit: 'diamonds',
        },
      ],
    },
  },
};
const fakePlayerPostBody = {
  data: {
    type: 'player',
    attributes: {
      memberId: 101,
      playerBet: 0,
      playerStatus: 'folded',
      playerCards: [
        {
          cardNumber: 'A',
          cardSuit: 'diamonds',
        },
      ],
    },
  },
};
const fakePlayerCardOnlyBody = {
  playerCards: [

  ],
};
const nonDuplicateArray = [1, 4, 2, 3, 7, 6, 200];
const duplicateArray = [3, 5, 3, 2, 4, 6];
module.exports = {
  fakeId,
  fakeMemberPostBody,
  fakeEmail,
  fakeName,
  fakeMemberPatchBody,
  rawMembers,
  fakeBaseUrl,
  fakeMemberQuery,
  testCases,
  fakeGamePostBody,
  fakeGamePatchBody,
  rawGames,
  mergedRawGames,
  serializedGames,
  serializedGame,
  databaseNameTestData,
  truthyList,
  falseyList,
  nonDuplicateArray,
  duplicateArray,
  testResult,
  fakePlayerPatchBody,
  fakePlayerPostBody,
  fakePlayerCardOnlyBody,
};
