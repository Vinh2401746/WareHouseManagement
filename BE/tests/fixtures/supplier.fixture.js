const faker = require('faker');
const mongoose = require('mongoose');
const Supplier = require('../../src/models/supplier.model');

const supplierOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  phone: faker.random.word(),
  email: faker.random.word(),
  address: faker.random.word(),
};

const supplierTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  phone: faker.random.word(),
  email: faker.random.word(),
  address: faker.random.word(),
};

const supplierThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  phone: faker.random.word(),
  email: faker.random.word(),
  address: faker.random.word(),
};

const insertSuppliers = async (suppliers) => {
  await Supplier.insertMany(suppliers.map((supplier) => ({ ...supplier })));
};

module.exports = {
  supplierOne,
  supplierTwo,
  supplierThree,
  insertSuppliers,
};
