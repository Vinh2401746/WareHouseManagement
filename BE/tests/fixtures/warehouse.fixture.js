const faker = require('faker');
const Warehouse = require('../../src/models/warehouse.model');

const warehouseOne = {
		name: faker.random.word(),
		branch: faker.random.word(),
		address: faker.random.word(),
	};

const warehouseTwo = {
		name: faker.random.word(),
		branch: faker.random.word(),
		address: faker.random.word(),
	};

const warehouseThree = {
		name: faker.random.word(),
		branch: faker.random.word(),
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
