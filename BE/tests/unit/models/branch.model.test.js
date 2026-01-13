const faker = require('faker');
const { Branch } = require('../../../src/models');

describe('Branch model', () => {
  describe('Branch validation', () => {
    let newBranch;

    beforeEach(() => {
      newBranch = {
		name: faker.random.word(),
		address: faker.random.word(),
		phone: faker.random.word(),
	};
    });

    test('should correctly validate a valid branch', async () => {
      await expect(new Branch(newBranch).validate()).resolves.toBeUndefined();
    });
  });
});
