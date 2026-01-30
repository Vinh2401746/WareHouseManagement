const faker = require('faker');
const { ProductBatch } = require('../../../src/models');

describe('ProductBatch model', () => {
  describe('ProductBatch validation', () => {
    let newProductBatch;

    beforeEach(() => {
      newProductBatch = {
		product: faker.random.word(),
		warehouse: faker.random.word(),
		batchCode: faker.random.word(),
		manufactureDate: faker.random.word(),
		quantity: faker.random.number(),
		importPrice: faker.random.number(),
	};
    });

    test('should correctly validate a valid productBatch', async () => {
      await expect(new ProductBatch(newProductBatch).validate()).resolves.toBeUndefined();
    });
  });
});
