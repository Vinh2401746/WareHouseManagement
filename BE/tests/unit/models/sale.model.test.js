const faker = require('faker');
const mongoose = require('mongoose');
const { Sale } = require('../../../src/models');

describe('Sale model', () => {
  describe('Sale validation', () => {
    let newSale;

    beforeEach(() => {
      newSale = {
        code: `SALE-${Date.now()}`,
        customerName: faker.name.findName(),
        note: faker.lorem.sentence(),
        branch: new mongoose.Types.ObjectId(),
        warehouse: new mongoose.Types.ObjectId(),
        soldBy: new mongoose.Types.ObjectId(),
        saleDate: new Date(),
        totalAmount: 1000000,
        discountMoney: 50000,
        taxMoney: 95000,
        totalAmountAfterFax: 1045000,
        items: [
          {
            product: new mongoose.Types.ObjectId(),
            batch: new mongoose.Types.ObjectId(),
            quantity: 10,
            price: 100000,
            lineTotal: 1045000,
            costPrice: 80000,
            costTotal: 800000,
          },
        ],
      };
    });

    test('should correctly validate a valid sale', async () => {
      await expect(new Sale(newSale).validate()).resolves.toBeUndefined();
    });
  });
});
