const mongoose = require('mongoose');
const ApiError = require('../../../src/utils/ApiError');

jest.mock('../../../src/models', () => ({
  Product: {
    paginate: jest.fn(),
    findById: jest.fn(),
  },
  ProductBatch: {
    aggregate: jest.fn(),
  },
  InventoryTransaction: {
    aggregate: jest.fn(),
  },
  Sale: {
    aggregate: jest.fn(),
  },
}));

const { Product, ProductBatch, InventoryTransaction, Sale } = require('../../../src/models');
const productInventoryService = require('../../../src/services/productInventory.service');

describe('productInventory.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildProductDoc = (overrides = {}) => {
    const base = {
      _id: mongoose.Types.ObjectId(),
      code: 'SP-001',
      name: 'Sản phẩm A',
      minStock: 5,
      unit: { _id: mongoose.Types.ObjectId(), name: 'Cái', code: 'EA' },
      toJSON() {
        return this;
      },
    };
    return { ...base, ...overrides };
  };

  test('getInventoryOverview should merge stock, sale và export data kèm cảnh báo thiếu cost', async () => {
    const warehouseId = mongoose.Types.ObjectId();
    const productDoc = buildProductDoc();

    Product.paginate.mockResolvedValue({
      results: [productDoc],
      page: 1,
      limit: 10,
      totalResults: 1,
      totalPages: 1,
    });

    ProductBatch.aggregate.mockResolvedValue([
      {
        _id: productDoc._id,
        totalQuantity: 3,
        totalValue: 45000,
        lastImportAt: new Date('2024-01-01T00:00:00Z'),
        byWarehouse: [
          {
            warehouse: warehouseId,
            quantity: 3,
            value: 45000,
          },
        ],
      },
    ]);

    Sale.aggregate.mockResolvedValue([
      {
        _id: productDoc._id,
        revenue: 100000,
        cost: 60000,
        quantity: 4,
        lastExportAt: new Date('2024-01-05T00:00:00Z'),
        missingCostLines: 1,
      },
    ]);

    InventoryTransaction.aggregate.mockResolvedValue([
      {
        _id: productDoc._id,
        quantity: 1,
        cost: 5000,
        lastExportAt: new Date('2024-01-04T00:00:00Z'),
        missingCostLines: 2,
      },
    ]);

    const result = await productInventoryService.getInventoryOverview({ keyword: 'SP', alertOnly: false }, { limit: 10, page: 1 });

    expect(result.results).toHaveLength(1);
    expect(result.results[0].product.code).toBe('SP-001');
    expect(result.results[0].totalStock).toBe(3);
    expect(result.results[0].isBelowMin).toBe(true);
    expect(result.results[0].profit).toBe(35000);
    expect(result.summary.totalStock).toBe(3);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/thiếu giá vốn/i);
  });

  test('getInventoryDetail should trả dữ liệu chi tiết và hợp nhất lịch sử', async () => {
    const warehouseId = mongoose.Types.ObjectId();
    const productDoc = buildProductDoc({ _id: mongoose.Types.ObjectId(), code: 'SP-002' });
    const productQuery = {
      populate: jest.fn().mockResolvedValue(productDoc),
    };
    Product.findById.mockReturnValue(productQuery);

    ProductBatch.aggregate.mockResolvedValue([
      {
        _id: productDoc._id,
        totalQuantity: 8,
        totalValue: 96000,
        lastImportAt: new Date('2024-02-01T00:00:00Z'),
        byWarehouse: [
          {
            warehouse: warehouseId,
            quantity: 8,
            value: 96000,
          },
        ],
      },
    ]);

    const saleSummaryResponse = [
      {
        _id: productDoc._id,
        revenue: 150000,
        cost: 90000,
        quantity: 5,
        lastExportAt: new Date('2024-02-10T00:00:00Z'),
        missingCostLines: 0,
      },
    ];

    const saleHistoryResponse = [
      {
        saleId: mongoose.Types.ObjectId(),
        saleDate: new Date('2024-02-10T00:00:00Z'),
        quantity: 2,
        price: 30000,
        lineTotal: 60000,
        costTotal: 36000,
      },
    ];

    Sale.aggregate.mockImplementation((pipeline) => {
      const hasLimit = pipeline.some((stage) => stage.$limit);
      return hasLimit ? Promise.resolve(saleHistoryResponse) : Promise.resolve(saleSummaryResponse);
    });

    const manualSummaryResponse = [
      {
        _id: productDoc._id,
        quantity: 1,
        cost: 4000,
        lastExportAt: new Date('2024-02-05T00:00:00Z'),
        missingCostLines: 0,
      },
    ];

    const importHistoryResponse = [
      {
        transactionId: mongoose.Types.ObjectId(),
        transactionDate: new Date('2024-02-01T00:00:00Z'),
        quantity: 5,
        price: 12000,
        totalAmount: 60000,
      },
    ];

    const manualHistoryResponse = [
      {
        transactionId: mongoose.Types.ObjectId(),
        transactionDate: new Date('2024-02-05T00:00:00Z'),
        quantity: 1,
        costTotal: 4000,
      },
    ];

    InventoryTransaction.aggregate.mockImplementation((pipeline) => {
      const matchStage = pipeline[0].$match || {};
      const hasLimit = pipeline.some((stage) => stage.$limit);
      if (matchStage.type === 'IMPORT') {
        return Promise.resolve(importHistoryResponse);
      }
      if (matchStage.type === 'EXPORT' && hasLimit) {
        return Promise.resolve(manualHistoryResponse);
      }
      return Promise.resolve(manualSummaryResponse);
    });

    const detail = await productInventoryService.getInventoryDetail(productDoc._id.toString(), {
      warehouse: warehouseId.toString(),
    });

    expect(detail.product.code).toBe('SP-002');
    expect(detail.stockSnapshot.totalStock).toBe(8);
    expect(detail.profitSummary.revenue).toBe(150000);
    expect(detail.profitSummary.profit).toBe(56000);
    expect(detail.histories.sales).toHaveLength(1);
    expect(detail.histories.imports).toHaveLength(1);
    expect(detail.histories.manualExports).toHaveLength(1);
  });

  test('getInventoryDetail should throw ApiError nếu sản phẩm không tồn tại', async () => {
    Product.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(productInventoryService.getInventoryDetail(mongoose.Types.ObjectId().toString(), {})).rejects.toBeInstanceOf(ApiError);
  });
});
