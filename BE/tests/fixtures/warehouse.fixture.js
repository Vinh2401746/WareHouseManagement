const mongoose = require('mongoose');
const faker = require('faker');
const Warehouse = require('../../src/models/warehouse.model');
const { branchOne, branchTwo } = require('./branch.fixture');

const warehouseOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  branch: branchOne._id,
  address: faker.random.word(),
};

const warehouseTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  branch: branchOne._id,
  address: faker.random.word(),
};

const warehouseThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  branch: branchTwo._id,
  address: faker.random.word(),
};

const insertWarehouses = async (warehouses) => {
  await Warehouse.insertMany(warehouses.map((warehouse) => ({ ...warehouse })));
};

module.exports = {
  warehouseOne,
  warehouseTwo,
  warehouseThree,
  insertWarehouses,
};
