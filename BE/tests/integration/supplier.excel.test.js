const request = require('supertest');
const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOneAccessToken } = require('../fixtures/token.fixture');
const { supplierOne, supplierTwo, insertSuppliers } = require('../fixtures/supplier.fixture');

setupTestDB();

const binaryParser = (res, callback) => {
  res.setEncoding('binary');
  res.data = '';
  res.on('data', (chunk) => {
    res.data += chunk;
  });
  res.on('end', () => {
    callback(null, Buffer.from(res.data, 'binary'));
  });
};

const buildSupplierWorkbookBuffer = async (rows) => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Nhà cung cấp');

  ws.addRow(['Tên', 'SĐT', 'Email', 'Địa chỉ']);
  rows.forEach((r) => ws.addRow([r.name, r.phone, r.email, r.address]));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

describe('Supplier Excel routes', () => {
  describe('GET /v1/supplier/import-template', () => {
    test('should return 200 and an xlsx file', async () => {
      const res = await request(app)
        .get('/v1/supplier/import-template')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .buffer(true)
        .parse(binaryParser)
        .expect(httpStatus.OK);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(res.body);
      const ws = workbook.worksheets[0];
      expect(ws).toBeDefined();

      const headers = [];
      ws.getRow(1).eachCell((cell) => headers.push(String(cell.value || '').trim()));
      expect(headers).toEqual(['Tên', 'SĐT', 'Email', 'Địa chỉ']);
    });
  });

  describe('GET /v1/supplier/export', () => {
    test('should return 200 and an xlsx export', async () => {
      await insertSuppliers([supplierOne, supplierTwo]);

      const res = await request(app)
        .get('/v1/supplier/export')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .buffer(true)
        .parse(binaryParser)
        .expect(httpStatus.OK);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(res.body);
      const ws = workbook.worksheets[0];
      expect(ws).toBeDefined();

      const headers = [];
      ws.getRow(1).eachCell((cell) => headers.push(String(cell.value || '').trim()));
      expect(headers).toEqual(['Tên', 'SĐT', 'Email', 'Địa chỉ']);
    });
  });

  describe('POST /v1/supplier/import', () => {
    test('should import suppliers from xlsx with partial success contract', async () => {
      const buffer = await buildSupplierWorkbookBuffer([
        { name: 'NCC 1', phone: '0900000001', email: 'ncc1@example.com', address: 'HN' },
        { name: '', phone: '0900000002', email: 'bad-email', address: 'HCM' },
      ]);

      const res = await request(app)
        .post('/v1/supplier/import')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .attach('file', buffer, {
          filename: 'suppliers.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          imported: expect.any(Number),
          updated: expect.any(Number),
          errors: expect.any(Array),
        })
      );
      expect(res.body.imported + res.body.updated).toBeGreaterThanOrEqual(1);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
    });

    test('should reject non-xlsx excel mime type (.xls)', async () => {
      const buffer = await buildSupplierWorkbookBuffer([
        { name: 'NCC 1', phone: '0900000001', email: 'ncc1@example.com', address: 'HN' },
      ]);

      await request(app)
        .post('/v1/supplier/import')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .attach('file', buffer, {
          filename: 'suppliers.xls',
          contentType: 'application/vnd.ms-excel',
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
