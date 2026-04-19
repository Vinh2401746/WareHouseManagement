const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const tokenService = require('../../src/services/token.service');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const { WarehouseTransfer, ProductBatch, InventoryTransaction, Product, Unit } = require('../../src/models');
const { userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userTwoAccessToken } = require('../fixtures/token.fixture');
const { branchOne, insertBranchs } = require('../fixtures/branch.fixture');
const { warehouseOne, warehouseTwo, insertWarehouses } = require('../fixtures/warehouse.fixture');
const { ROLES } = require('../fixtures/rbac.fixture');

setupTestDB({ seedUsers: false });

const buildAccessToken = (userId) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  return tokenService.generateToken(userId, accessTokenExpires, tokenTypes.ACCESS);
};

describe('WarehouseTransfer routes', () => {
  let unitDoc;
  let productDoc;

  const warehouseManager = {
    _id: mongoose.Types.ObjectId(),
    name: 'Warehouse Manager',
    email: 'warehouse.manager@test.local',
    password: 'admin123',
    role: ROLES.WAREHOUSE_MANAGER,
    roleKey: ROLES.WAREHOUSE_MANAGER,
    branch: branchOne._id,
    isEmailVerified: false,
  };

  beforeEach(async () => {
    await insertBranchs([branchOne]);
    await insertWarehouses([warehouseOne, warehouseTwo]);

    unitDoc = await Unit.create({ code: 'UNIT-001', name: 'Cái' });
    productDoc = await Product.create({
      code: 'SP-001',
      name: 'Sản phẩm 1',
      unit: unitDoc._id,
      minStock: 0,
      sellingPrice: 0,
      branch: branchOne._id,
    });

    await insertUsers([userTwo, warehouseManager]);
  });

  test('should create transfer PENDING', async () => {
    const batch = await ProductBatch.create({
      product: productDoc._id,
      productCode: productDoc.code,
      productName: productDoc.name,
      unit: unitDoc._id,
      warehouse: warehouseOne._id,
      batchCode: 'B-001',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      quantity: 10,
      importPrice: 10000,
      totalAmount: 100000,
    });

    const res = await request(app)
      .post('/v1/warehouseTransfer')
      .set('Authorization', `Bearer ${userTwoAccessToken}`)
      .send({
        sourceWarehouse: warehouseOne._id.toHexString(),
        destinationWarehouse: warehouseTwo._id.toHexString(),
        reason: 'Luân chuyển test',
        items: [{ product: productDoc._id.toHexString(), batch: batch._id.toHexString(), quantity: 3 }],
      })
      .expect(httpStatus.CREATED);

    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('PENDING');
    expect(res.body.code).toMatch(/^LC-/);
  });

  test('should approve transfer and move stock (batch specified)', async () => {
    const managerAccessToken = buildAccessToken(warehouseManager._id);

    const sourceBatch = await ProductBatch.create({
      product: productDoc._id,
      productCode: productDoc.code,
      productName: productDoc.name,
      unit: unitDoc._id,
      warehouse: warehouseOne._id,
      batchCode: 'B-002',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      quantity: 10,
      importPrice: 10000,
      totalAmount: 100000,
    });

    const createRes = await request(app)
      .post('/v1/warehouseTransfer')
      .set('Authorization', `Bearer ${userTwoAccessToken}`)
      .send({
        sourceWarehouse: warehouseOne._id.toHexString(),
        destinationWarehouse: warehouseTwo._id.toHexString(),
        reason: 'Luân chuyển test',
        items: [{ product: productDoc._id.toHexString(), batch: sourceBatch._id.toHexString(), quantity: 4 }],
      })
      .expect(httpStatus.CREATED);

    const transferId = createRes.body.id;

    const approveRes = await request(app)
      .patch(`/v1/warehouseTransfer/${transferId}/approve`)
      .set('Authorization', `Bearer ${managerAccessToken}`)
      .send()
      .expect(httpStatus.OK);

    expect(approveRes.body.status).toBe('COMPLETED');
    expect(approveRes.body).toHaveProperty('exportTransaction');
    expect(approveRes.body).toHaveProperty('importTransaction');
    expect(approveRes.body.items[0].allocations).toHaveLength(1);

    const updatedSource = await ProductBatch.findById(sourceBatch._id);
    expect(updatedSource.quantity).toBe(6);

    const transferDoc = await WarehouseTransfer.findById(transferId).lean();
    const destinationBatchId = transferDoc.items[0].allocations[0].destinationBatch;
    const destinationBatch = await ProductBatch.findById(destinationBatchId);
    expect(destinationBatch).toBeDefined();
    expect(destinationBatch.warehouse.toString()).toBe(warehouseTwo._id.toString());
    expect(destinationBatch.quantity).toBe(4);

    const exportTx = await InventoryTransaction.findById(transferDoc.exportTransaction).lean();
    const importTx = await InventoryTransaction.findById(transferDoc.importTransaction).lean();

    expect(exportTx.type).toBe('EXPORT');
    expect(exportTx.status).toBe('COMPLETED');
    expect(exportTx.warehouse.toString()).toBe(warehouseOne._id.toString());

    expect(importTx.type).toBe('IMPORT');
    expect(importTx.status).toBe('COMPLETED');
    expect(importTx.warehouse.toString()).toBe(warehouseTwo._id.toString());
  });

  test('should allow creator cancel PENDING transfer', async () => {
    const batch = await ProductBatch.create({
      product: productDoc._id,
      productCode: productDoc.code,
      productName: productDoc.name,
      unit: unitDoc._id,
      warehouse: warehouseOne._id,
      batchCode: 'B-003',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      quantity: 10,
      importPrice: 10000,
      totalAmount: 100000,
    });

    const createRes = await request(app)
      .post('/v1/warehouseTransfer')
      .set('Authorization', `Bearer ${userTwoAccessToken}`)
      .send({
        sourceWarehouse: warehouseOne._id.toHexString(),
        destinationWarehouse: warehouseTwo._id.toHexString(),
        reason: 'Luân chuyển test',
        items: [{ product: productDoc._id.toHexString(), batch: batch._id.toHexString(), quantity: 2 }],
      })
      .expect(httpStatus.CREATED);

    const transferId = createRes.body.id;

    const cancelRes = await request(app)
      .put(`/v1/warehouseTransfer/${transferId}/cancel`)
      .set('Authorization', `Bearer ${userTwoAccessToken}`)
      .send({ cancelReason: 'Tạo nhầm' })
      .expect(httpStatus.OK);

    expect(cancelRes.body.status).toBe('CANCELED');

    const transferDoc = await WarehouseTransfer.findById(transferId).lean();
    expect(transferDoc.status).toBe('CANCELED');
  });
});
