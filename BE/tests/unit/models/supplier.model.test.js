const faker = require('faker');
const { Supplier } = require('../../../src/models');

describe('Supplier model', () => {
  describe('Supplier validation', () => {
    let newSupplier;

    beforeEach(() => {
      newSupplier = {
        name: faker.random.word(),
        phone: faker.random.word(),
        email: faker.random.word(),
        address: faker.random.word(),
      };
    });

    test('should correctly validate a valid supplier', async () => {
      await expect(new Supplier(newSupplier).validate()).resolves.toBeUndefined();
    });
  });
});
