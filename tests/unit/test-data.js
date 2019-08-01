const fakeId = 'fakeId';
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
module.exports = {
  fakeId,
  fakeMemberPostBody,
  fakeEmail,
  fakeName,
  fakeMemberPatchBody,
};
