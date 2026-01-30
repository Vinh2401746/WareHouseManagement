const faker = require('faker');
const Sale = require('../../src/models/sale.model');

const saleOne = {
  code: faker.random.word(),
  branch: faker.random.word(),
  warehouse: faker.random.word(),
  soldBy: faker.random.word(),
  saleDate: faker.random.word(),
  totalAmount: faker.random.word(),
  items: faker.random.word(),
};

const saleTwo = {
  code: faker.random.word(),
  branch: faker.random.word(),
  warehouse: faker.random.word(),
  soldBy: faker.random.word(),
  saleDate: faker.random.word(),
  totalAmount: faker.random.word(),
  items: faker.random.word(),
};

const saleThree = {
  code: faker.random.word(),
  branch: faker.random.word(),
  warehouse: faker.random.word(),
  soldBy: faker.random.word(),
  saleDate: faker.random.word(),
  totalAmount: faker.random.word(),
  items: faker.random.word(),
};

const insertSales = async (sales) => {
  await Sale.insertMany(sales.map((sale) => ({ ...sale })));
};

module.exports = {
  saleOne,
  saleTwo,
  saleThree,
  insertSales,
};
