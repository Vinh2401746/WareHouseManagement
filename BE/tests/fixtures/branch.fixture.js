const mongoose = require('mongoose');
const faker = require('faker');
const Branch = require('../../src/models/branch.model');

const branchOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  address: faker.random.word(),
  phone: faker.random.word(),
};

const branchTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  address: faker.random.word(),
  phone: faker.random.word(),
};

const branchThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
  address: faker.random.word(),
  phone: faker.random.word(),
};

const insertBranchs = async (branches) => {
  await Branch.insertMany(branches.map((branch) => ({ ...branch })));
};

module.exports = {
  branchOne,
  branchTwo,
  branchThree,
  insertBranchs,
};
