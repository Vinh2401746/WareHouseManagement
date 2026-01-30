const faker = require('faker');
const Product = require('../../src/models/product.model');

const productOne = {
  code: faker.random.word(),
  name: faker.random.word(),
  category: faker.random.word(),
  unit: faker.random.word(),
  minStock: faker.random.word(),
};

const productTwo = {
  code: faker.random.word(),
  name: faker.random.word(),
  category: faker.random.word(),
  unit: faker.random.word(),
  minStock: faker.random.word(),
};

const productThree = {
  code: faker.random.word(),
  name: faker.random.word(),
  category: faker.random.word(),
  unit: faker.random.word(),
  minStock: faker.random.word(),
};

const insertProducts = async (products) => {
  await Product.insertMany(products.map((product) => ({ ...product })));
};

module.exports = {
  productOne,
  productTwo,
  productThree,
  insertProducts,
};
