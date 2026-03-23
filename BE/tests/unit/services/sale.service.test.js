const mongoose = require('mongoose');
const faker = require('faker');

jest.mock('../../../src/models', () => ({
  Sale: {
    create: jest.fn(),
    paginate: jest.fn(),
    findById: jest.fn(),
  },
  InventoryTransaction: {
    create: jest.fn(),
  },
  ProductBatch: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
  Warehouse: {
    findById: jest.fn(),
  },
}));

const { Sale, InventoryTransaction, ProductBatch, Warehouse } = require('../../../src/models');
const saleService = require('../../../src/services/sale.service');

const buildFutureDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

describe('Sale service - cost snapshot', () => {
  const baseSaleBody = {
    branch: mongoose.Types.ObjectId().toHexString(),
    warehouse: mongoose.Types.ObjectId().toHexString(),
    customerName: faker.name.findName(),
    note: faker.lorem.sentence(),
    items: [],
  };

  const userCtx = { id: mongoose.Types.ObjectId().toHexString() };

  beforeEach(() => {
    jest.clearAllMocks();
    Warehouse.findById.mockResolvedValue({ branch: baseSaleBody.branch });
    ProductBatch.findOne.mockReset();
    ProductBatch.find.mockReset();
    Sale.create.mockResolvedValue({ id: mongoose.Types.ObjectId().toHexString() });
    InventoryTransaction.create.mockResolvedValue({});
  });

  test('should snapshot cost when batch is explicitly provided', async () => {
    const batchDoc = {
      _id: mongoose.Types.ObjectId(),
      quantity: 10,
      importPrice: 15000,
      expiryDate: buildFutureDate(),
      save: jest.fn().mockResolvedValue(),
    };
    ProductBatch.findOne.mockResolvedValue(batchDoc);
    ProductBatch.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const item = {
      product: mongoose.Types.ObjectId(),
      batch: batchDoc._id,
      quantity: 2,
      price: 32000,
    };

    await saleService.createSale({ ...baseSaleBody, items: [item] }, userCtx);

    const salePayload = Sale.create.mock.calls[0][0];
    expect(salePayload.items[0]).toEqual(
      expect.objectContaining({
        costPrice: 15000,
        costTotal: 30000,
      })
    );

    const inventoryPayload = InventoryTransaction.create.mock.calls[0][0];
    expect(inventoryPayload.items[0]).toEqual(
      expect.objectContaining({
        costPrice: 15000,
        costTotal: 30000,
      })
    );
  });

  test('should snapshot cost when batch is auto-allocated', async () => {
    ProductBatch.findOne.mockResolvedValue(null);
    const autoBatch = {
      _id: mongoose.Types.ObjectId(),
      quantity: 5,
      importPrice: 18000,
      expiryDate: buildFutureDate(),
      save: jest.fn().mockResolvedValue(),
    };
    ProductBatch.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([autoBatch]),
    });

    const item = {
      product: mongoose.Types.ObjectId(),
      quantity: 2,
      price: 40000,
    };

    await saleService.createSale({ ...baseSaleBody, items: [item] }, userCtx);

    const salePayload = Sale.create.mock.calls[0][0];
    expect(salePayload.items[0]).toEqual(
      expect.objectContaining({
        costPrice: 18000,
        costTotal: 36000,
      })
    );

    const inventoryPayload = InventoryTransaction.create.mock.calls[0][0];
    expect(inventoryPayload.items[0]).toEqual(
      expect.objectContaining({
        costPrice: 18000,
        costTotal: 36000,
      })
    );
  });
});
