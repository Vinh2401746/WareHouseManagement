const faker = require('faker');
const { Sale } = require('../../../src/models');

describe('Sale model', () => {
  describe('Sale validation', () => {
    let newSale;

    beforeEach(() => {
      newSale = {
		code: faker.random.word(),
		branch: faker.random.word(),
		warehouse: faker.random.word(),
		soldBy: faker.random.word(),
		saleDate: faker.random.word(),
		totalAmount: faker.random.word(),
		items: faker.random.word(),
	};
    });

    test('should correctly validate a valid sale', async () => {
      await expect(new Sale(newSale).validate()).resolves.toBeUndefined();
    });
  });
});
