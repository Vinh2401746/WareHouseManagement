const faker = require('faker');
const { Category } = require('../../../src/models');

describe('Category model', () => {
  describe('Category validation', () => {
    let newCategory;

    beforeEach(() => {
      newCategory = {
		code: faker.random.word(),
		name: faker.random.word(),
	};
    });

    test('should correctly validate a valid category', async () => {
      await expect(new Category(newCategory).validate()).resolves.toBeUndefined();
    });
  });
});
