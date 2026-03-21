const fs = require('fs');
const path = require('path');
const httpStatus = require('http-status');
const request = require('supertest');
const app = require('../../src/app');
const config = require('../../src/config/config');
const setupTestDB = require('../utils/setupTestDB');
const Product = require('../../src/models/product.model');
const Unit = require('../../src/models/unit.model');
const { insertBranchs, branchOne, branchTwo } = require('../fixtures/branch.fixture');
const { insertUsers, admin } = require('../fixtures/user.fixture');
const { adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

const sampleImageBuffer = Buffer.from('dummy-image-content');
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

describe('Product image upload APIs', () => {
  let unit;
  const createdFiles = new Set();

  const createProductWithImage = async (payloadOverrides = {}) => {
    const payload = {
      code: payloadOverrides.code || `PRD-${Date.now()}`,
      name: payloadOverrides.name || 'Sản phẩm có ảnh',
      unit: payloadOverrides.unit || unit.id,
      minStock: payloadOverrides.minStock || '5',
      package: payloadOverrides.package,
    };

    const requestBuilder = request(app)
      .post('/v1/product')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    Object.entries(payload).forEach(([field, value]) => {
      if (value !== undefined) {
        requestBuilder.field(field, value);
      }
    });

    const response = await requestBuilder
      .attach('image', payloadOverrides.imageBuffer || sampleImageBuffer, {
        filename: payloadOverrides.filename || 'test.png',
        contentType: payloadOverrides.contentType || 'image/png',
      })
      .expect(httpStatus.CREATED);

    const product = await Product.findById(response.body.id);
    const absoluteImagePath = path.join(config.file.uploadDir, product.imagePath);
    createdFiles.add(absoluteImagePath);
    return { response, product, absoluteImagePath };
  };

  beforeEach(async () => {
    await insertBranchs([branchOne, branchTwo]);
    await insertUsers([admin]);
    unit = await Unit.create({ code: `UNIT-${Date.now()}`, name: 'Cái' });
  });

  afterEach(async () => {
    await Promise.all(
      Array.from(createdFiles).map(async (filePath) => {
        try {
          await fs.promises.unlink(filePath);
        } catch (error) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      })
    );
    createdFiles.clear();
  });

  it('tạo sản phẩm với ảnh và phục vụ file qua static endpoint', async () => {
    const { response, absoluteImagePath } = await createProductWithImage();

    expect(response.body.imageUrl).toMatch(new RegExp(`^${config.file.publicPrefix}/`));
    expect(response.body.unit).toMatchObject({
      id: unit.id,
      code: unit.code,
      name: unit.name,
    });
    await fs.promises.access(absoluteImagePath);

    const staticResponse = await request(app)
      .get(response.body.imageUrl)
      .buffer()
      .parse(binaryParser)
      .expect(httpStatus.OK);
    expect(Buffer.compare(staticResponse.body, sampleImageBuffer)).toBe(0);
  });

  it('đặt tên file ảnh dựa theo mã sản phẩm đã chuẩn hóa', async () => {
    const prettyCode = '  PRĐ ảnh Đẹp 123  ';
    const { product } = await createProductWithImage({ code: prettyCode });

    expect(product.imagePath.startsWith('products/prd-anh-dep-123-')).toBe(true);
    expect(product.imagePath.endsWith('.png')).toBe(true);
  });

  it('cho phép removeImage=true xoá ảnh cũ khỏi ổ đĩa', async () => {
    const { response, product, absoluteImagePath } = await createProductWithImage();

    const updateResponse = await request(app)
      .put(`/v1/product/${product.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .field('removeImage', 'true')
      .field('code', `${response.body.code}`)
      .field('name', response.body.name)
      .field('unit', unit.id)
      .field('minStock', '7')
      .expect(httpStatus.OK);

    expect(updateResponse.body.imageUrl).toBeNull();
    expect(updateResponse.body.unit).toMatchObject({ id: unit.id });
    await expect(fs.promises.access(absoluteImagePath)).rejects.toThrow();

    const refreshedProduct = await Product.findById(product.id);
    expect(refreshedProduct.imagePath).toBeUndefined();
  });
});
