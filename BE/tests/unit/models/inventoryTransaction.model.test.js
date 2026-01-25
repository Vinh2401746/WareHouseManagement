const faker = require('faker');
const { InventoryTransaction } = require('../../../src/models');

describe('InventoryTransaction model', () => {
  describe('InventoryTransaction validation', () => {
    let newInventoryTransaction;

    beforeEach(() => {
      newInventoryTransaction = {
		type: faker.random.word(),
		reason: faker.random.word(),
		warehouse: faker.random.word(),
		supplier: faker.random.word(),
		sale: faker.random.word(),
		createdBy: faker.random.word(),
		transactionDate: faker.random.word(),
		items: faker.random.word(),
	};
    });

    test('should correctly validate a valid inventoryTransaction', async () => {
      await expect(new InventoryTransaction(newInventoryTransaction).validate()).resolves.toBeUndefined();
    });
  });
});
