const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Product } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { productOne, productTwo, productThree, insertProducts } = require('../fixtures/product.fixture');

setupTestDB();

describe('Product routes', () => {
  describe('POST /v1/product', () => {
    let newProduct;

    beforeEach(() => {
      newProduct = {
        code: faker.random.word(),
        name: faker.random.word(),
        category: faker.random.word(),
        unit: faker.random.word(),
        minStock: faker.random.word(),
      };
    });

    test('should return 201 and successfully create new product if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);

      const res = await request(app)
        .post('/v1/product')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newProduct.type });

      const dbProduct = await Product.findById(res.body.id);
      expect(dbProduct).toBeDefined();
      expect(dbProduct).toMatchObject({ type: newProduct.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/product').send(newProduct).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/product', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertProducts([productOne, productTwo]);

      const res = await request(app)
        .get('/v1/product')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: productOne._id.toHexString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertProducts([productOne, productTwo]);

      await request(app).get('/v1/product').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all products', async () => {
      await insertProducts([productOne, productTwo]);

      await request(app)
        .get('/v1/product')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertProducts([productOne, productTwo, productThree]);

      const res = await request(app)
        .get('/v1/product')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(productOne._id.toHexString());
      expect(res.body.results[1].id).toBe(productTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertProducts([productOne, productTwo, productThree]);

      const res = await request(app)
        .get('/v1/product')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
    });
  });

  describe('GET /v1/product/:productId', () => {
    test('should return 200 and the product object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);

      const res = await request(app)
        .get(`/v1/product/${productOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: productOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);

      await request(app).get(`/v1/product/${productOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);

      await request(app)
        .get('/v1/product/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if product is not found', async () => {
      await insertProducts([productTwo]);

      await request(app)
        .get(`/v1/product/${productOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/product/:productId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);

      await request(app)
        .delete(`/v1/product/${productOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbProduct = await Product.findById(productOne._id);
      expect(dbProduct).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);

      await request(app).delete(`/v1/product/${productOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);

      await request(app)
        .delete('/v1/product/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if product already is not found', async () => {
      await insertProducts([productTwo]);

      await request(app)
        .delete(`/v1/product/${productOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/product/:productId', () => {
    test('should return 200 and successfully update product if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);
      const updateBody = {
        code: faker.random.word(),
        name: faker.random.word(),
        category: faker.random.word(),
        unit: faker.random.word(),
        minStock: faker.random.word(),
      };

      const res = await request(app)
        .patch(`/v1/product/${productOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const validationData = {
        id: productOne._id.toHexString(),
      };
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbProduct = await Product.findById(productOne._id);
      expect(dbProduct).toBeDefined();
      expect(dbProduct.password).not.toBe(updateBody.password);
      expect(dbProduct).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProducts([productOne]);
      const updateBody = {
        code: faker.random.word(),
        name: faker.random.word(),
        category: faker.random.word(),
        unit: faker.random.word(),
        minStock: faker.random.word(),
      };
      await request(app).patch(`/v1/product/${productOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertProducts([productTwo]);
      const updateBody = {
        code: faker.random.word(),
        name: faker.random.word(),
        category: faker.random.word(),
        unit: faker.random.word(),
        minStock: faker.random.word(),
      };
      await request(app)
        .patch(`/v1/product/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
