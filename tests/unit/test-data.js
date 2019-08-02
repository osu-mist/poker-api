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

const fakeMemberQuery = {
  memberNickname: 'J',
  memberEmail: 'abc@efg.com',
};
module.exports = {
  fakeId,
  fakeMemberPostBody,
  fakeEmail,
  fakeName,
  fakeMemberPatchBody,
  rawMembers,
  fakeBaseUrl,
  fakeMemberQuery,
};
