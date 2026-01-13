const faker = require('faker');
const Branch = require('../../src/models/branch.model');

const branchOne = {
		name: faker.random.word(),
		address: faker.random.word(),
		phone: faker.random.word(),
	};

const branchTwo = {
		name: faker.random.word(),
		address: faker.random.word(),
		phone: faker.random.word(),
	};

const branchThree = {
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
