const fakeId = 'fakeId';
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

module.exports = {
  fakeId,
  fakeMemberPostBody,
};
