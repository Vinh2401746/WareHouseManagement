const faker = require('faker');
const { Unit } = require('../../../src/models');

describe('Unit model', () => {
  describe('Unit validation', () => {
    let newUnit;

    beforeEach(() => {
      newUnit = {
        code: faker.random.word(),
        name: faker.random.word(),
      };
    });

    test('should correctly validate a valid unit', async () => {
      await expect(new Unit(newUnit).validate()).resolves.toBeUndefined();
    });
  });
});
