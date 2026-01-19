const faker = require('faker');
const Supplier = require('../../src/models/supplier.model');

const supplierOne = {
		name: faker.random.word(),
		phone: faker.random.word(),
		email: faker.random.word(),
		address: faker.random.word(),
	};

const supplierTwo = {
		name: faker.random.word(),
		phone: faker.random.word(),
		email: faker.random.word(),
		address: faker.random.word(),
	};

const supplierThree = {
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
