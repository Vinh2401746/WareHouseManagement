const faker = require('faker');
const { Product } = require('../../../src/models');

describe('Product model', () => {
  describe('Product validation', () => {
    let newProduct;

    beforeEach(() => {
      newProduct = {
        code: faker.random.word(),
        name: faker.random.word(),
        category: faker.random.word(),
        unit: faker.random.word(),
        minStock: faker.random.word(),
      };
    });

    test('should correctly validate a valid product', async () => {
      await expect(new Product(newProduct).validate()).resolves.toBeUndefined();
    });
  });
});
