const faker = require('faker');
const InventoryTransaction = require('../../src/models/inventoryTransaction.model');

const inventoryTransactionOne = {
  type: faker.random.word(),
  reason: faker.random.word(),
  warehouse: faker.random.word(),
  supplier: faker.random.word(),
  sale: faker.random.word(),
  createdBy: faker.random.word(),
  transactionDate: faker.random.word(),
  items: faker.random.word(),
};

const inventoryTransactionTwo = {
  type: faker.random.word(),
  reason: faker.random.word(),
  warehouse: faker.random.word(),
  supplier: faker.random.word(),
  sale: faker.random.word(),
  createdBy: faker.random.word(),
  transactionDate: faker.random.word(),
  items: faker.random.word(),
};

const inventoryTransactionThree = {
  type: faker.random.word(),
  reason: faker.random.word(),
  warehouse: faker.random.word(),
  supplier: faker.random.word(),
  sale: faker.random.word(),
  createdBy: faker.random.word(),
  transactionDate: faker.random.word(),
  items: faker.random.word(),
};

const insertInventoryTransactions = async (inventoryTransactions) => {
  await InventoryTransaction.insertMany(inventoryTransactions.map((inventoryTransaction) => ({ ...inventoryTransaction })));
};

module.exports = {
  inventoryTransactionOne,
  inventoryTransactionTwo,
  inventoryTransactionThree,
  insertInventoryTransactions,
};
