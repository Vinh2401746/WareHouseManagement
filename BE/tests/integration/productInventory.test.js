const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { insertUsers, userOne, admin } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const { Branch, Warehouse, Unit, Product, ProductBatch, InventoryTransaction, Sale } = require('../../src/models');

setupTestDB();

const seedInventoryScenario = async () => {
  const branch = await Branch.create({ name: 'Chi nhánh tồn kho', address: 'Hà Nội', phone: '0900000000' });
  const warehouse = await Warehouse.create({ name: 'Kho tổng', branch: branch._id, address: 'Hà Nội' });
  const unit = await Unit.create({ code: 'EA', name: 'Cái' });
  const product = await Product.create({ code: 'INV-001', name: 'Sản phẩm tồn', unit: unit._id, minStock: 2 });

  const batch = await ProductBatch.create({
    product: product._id,
    productCode: product.code,
    productName: product.name,
    unit: unit._id,
    warehouse: warehouse._id,
    batchCode: 'BATCH-01',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    quantity: 5,
    importPrice: 15000,
    totalAmount: 75000,
  });

  await InventoryTransaction.create({
    type: 'IMPORT',
    reason: 'Mua hàng',
    warehouse: warehouse._id,
    transactionDate: new Date('2024-01-01T00:00:00Z'),
    items: [
      {
        product: product._id,
        batch: batch._id,
        quantity: 5,
        price: 15000,
        totalAmount: 75000,
      },
    ],
  });

  await Sale.create({
    code: 'SALE-INV-001',
    branch: branch._id,
    warehouse: warehouse._id,
    customerName: 'Khách lẻ',
    totalAmount: 100000,
    discountMoney: 0,
    taxMoney: 0,
    totalAmountAfterFax: 100000,
    saleDate: new Date('2024-01-05T00:00:00Z'),
    items: [
      {
        product: product._id,
        batch: batch._id,
        quantity: 2,
        price: 50000,
        lineTotal: 100000,
        costPrice: 30000,
        costTotal: 60000,
      },
    ],
  });

  await InventoryTransaction.create({
    type: 'EXPORT',
    reason: 'Điều chỉnh tồn',
    warehouse: warehouse._id,
    transactionDate: new Date('2024-01-04T00:00:00Z'),
    items: [
      {
        product: product._id,
        batch: batch._id,
        quantity: 1,
        price: 0,
        totalAmount: 0,
        costPrice: 15000,
        costTotal: 15000,
      },
    ],
  });

  return { product, warehouse };
};

describe('Product inventory routes', () => {
  let dataset;

  beforeEach(async () => {
    await insertUsers([admin, userOne]);
    dataset = await seedInventoryScenario();
  });

  describe('GET /v1/product/inventory-overview', () => {
    test('should return aggregated overview data for admin with permission', async () => {
      const res = await request(app)
        .get('/v1/product/inventory-overview')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({
          warehouse: dataset.warehouse._id.toHexString(),
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].product.code).toBe('INV-001');
      expect(res.body.results[0].totalStock).toBe(5);
      expect(res.body.results[0].profit).toBe(25000);
      expect(res.body.summary.totalRevenue).toBe(100000);
      expect(res.body.summary.totalProfit).toBe(25000);
      expect(res.body.dateRange).toEqual({
        startDate: expect.any(String),
        endDate: expect.any(String),
      });
    });

    test('should reject user without getProductInventory permission', async () => {
      await request(app)
        .get('/v1/product/inventory-overview')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /v1/product/:productId/inventory-detail', () => {
    test('should return stock snapshot and histories', async () => {
      const res = await request(app)
        .get(`/v1/product/${dataset.product._id.toHexString()}/inventory-detail`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({
          warehouse: dataset.warehouse._id.toHexString(),
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
        .expect(httpStatus.OK);

      expect(res.body.product.code).toBe('INV-001');
      expect(res.body.stockSnapshot.totalStock).toBe(5);
      expect(res.body.profitSummary.revenue).toBe(100000);
      expect(res.body.profitSummary.manualAdjustmentsCost).toBe(15000);
      expect(res.body.profitSummary.profit).toBe(25000);
      expect(res.body.histories.imports).toHaveLength(1);
      expect(res.body.histories.sales).toHaveLength(1);
      expect(res.body.histories.manualExports).toHaveLength(1);
    });
  });
});
