const faker = require('faker');
const { Warehouse } = require('../../../src/models');

describe('Warehouse model', () => {
  describe('Warehouse validation', () => {
    let newWarehouse;

    beforeEach(() => {
      newWarehouse = {
        name: faker.random.word(),
        branch: faker.random.word(),
        address: faker.random.word(),
      };
    });

    test('should correctly validate a valid warehouse', async () => {
      await expect(new Warehouse(newWarehouse).validate()).resolves.toBeUndefined();
    });
  });
});
