const faker = require('faker');
const ProductBatch = require('../../src/models/productBatch.model');

const productBatchOne = {
  product: faker.random.word(),
  warehouse: faker.random.word(),
  batchCode: faker.random.word(),
  manufactureDate: faker.random.word(),
  quantity: faker.random.number(),
  importPrice: faker.random.number(),
};

const productBatchTwo = {
  product: faker.random.word(),
  warehouse: faker.random.word(),
  batchCode: faker.random.word(),
  manufactureDate: faker.random.word(),
  quantity: faker.random.number(),
  importPrice: faker.random.number(),
};

const productBatchThree = {
  product: faker.random.word(),
  warehouse: faker.random.word(),
  batchCode: faker.random.word(),
  manufactureDate: faker.random.word(),
  quantity: faker.random.number(),
  importPrice: faker.random.number(),
};

const insertProductBatchs = async (productBatchs) => {
  await ProductBatch.insertMany(productBatchs.map((productBatch) => ({ ...productBatch })));
};

module.exports = {
  productBatchOne,
  productBatchTwo,
  productBatchThree,
  insertProductBatchs,
};
