const faker = require('faker');
const Unit = require('../../src/models/unit.model');

const unitOne = {
  code: faker.random.word(),
  name: faker.random.word(),
};

const unitTwo = {
  code: faker.random.word(),
  name: faker.random.word(),
};

const unitThree = {
  code: faker.random.word(),
  name: faker.random.word(),
};

const insertUnits = async (units) => {
  await Unit.insertMany(units.map((unit) => ({ ...unit })));
};

module.exports = {
  unitOne,
  unitTwo,
  unitThree,
  insertUnits,
};
