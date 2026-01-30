const faker = require('faker');
const Category = require('../../src/models/category.model');

const categoryOne = {
  code: faker.random.word(),
  name: faker.random.word(),
};

const categoryTwo = {
  code: faker.random.word(),
  name: faker.random.word(),
};

const categoryThree = {
  code: faker.random.word(),
  name: faker.random.word(),
};

const insertCategories = async (categories) => {
  await Category.insertMany(categories.map((category) => ({ ...category })));
};

module.exports = {
  categoryOne,
  categoryTwo,
  categoryThree,
  insertCategories,
};
