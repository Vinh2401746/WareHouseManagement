const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { ProductBatch } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const {
  productBatchOne,
  productBatchTwo,
  productBatchThree,
  insertProductBatchs,
} = require('../fixtures/productBatch.fixture');

setupTestDB();

describe('ProductBatch routes', () => {
  describe('POST /v1/productBatchs', () => {
    let newProductBatch;

    beforeEach(() => {
      newProductBatch = {
        product: faker.random.word(),
        warehouse: faker.random.word(),
        batchCode: faker.random.word(),
        manufactureDate: faker.random.word(),
        quantity: faker.random.number(),
        importPrice: faker.random.number(),
      };
    });

    test('should return 201 and successfully create new productBatch if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);

      const res = await request(app)
        .post('/v1/productBatchs')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newProductBatch)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newProductBatch.type });

      const dbProductBatch = await ProductBatch.findById(res.body.id);
      expect(dbProductBatch).toBeDefined();
      expect(dbProductBatch).toMatchObject({ type: newProductBatch.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/productBatchs').send(newProductBatch).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/productBatchs', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertProductBatchs([productBatchOne, productBatchTwo]);

      const res = await request(app)
        .get('/v1/productBatchs')
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
        id: productBatchOne._id.toHexString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertProductBatchs([productBatchOne, productBatchTwo]);

      await request(app).get('/v1/productBatchs').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all productBatchs', async () => {
      await insertProductBatchs([productBatchOne, productBatchTwo]);

      await request(app)
        .get('/v1/productBatchs')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertProductBatchs([productBatchOne, productBatchTwo, productBatchThree]);

      const res = await request(app)
        .get('/v1/productBatchs')
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
      expect(res.body.results[0].id).toBe(productBatchOne._id.toHexString());
      expect(res.body.results[1].id).toBe(productBatchTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertProductBatchs([productBatchOne, productBatchTwo, productBatchThree]);

      const res = await request(app)
        .get('/v1/productBatchs')
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

  describe('GET /v1/productBatchs/:productBatchId', () => {
    test('should return 200 and the productBatch object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);

      const res = await request(app)
        .get(`/v1/productBatchs/${productBatchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: productBatchOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);

      await request(app).get(`/v1/productBatchs/${productBatchOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if productBatchId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);

      await request(app)
        .get('/v1/productBatchs/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if productBatch is not found', async () => {
      await insertProductBatchs([productBatchTwo]);

      await request(app)
        .get(`/v1/productBatchs/${productBatchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/productBatchs/:productBatchId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);

      await request(app)
        .delete(`/v1/productBatchs/${productBatchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbProductBatch = await ProductBatch.findById(productBatchOne._id);
      expect(dbProductBatch).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);

      await request(app).delete(`/v1/productBatchs/${productBatchOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if productBatchId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);

      await request(app)
        .delete('/v1/productBatchs/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if productBatch already is not found', async () => {
      await insertProductBatchs([productBatchTwo]);

      await request(app)
        .delete(`/v1/productBatchs/${productBatchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/productBatchs/:productBatchId', () => {
    test('should return 200 and successfully update productBatch if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);
      const updateBody = {
        product: faker.random.word(),
        warehouse: faker.random.word(),
        batchCode: faker.random.word(),
        manufactureDate: faker.random.word(),
        quantity: faker.random.number(),
        importPrice: faker.random.number(),
      };

      const res = await request(app)
        .patch(`/v1/productBatchs/${productBatchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const validationData = {
        id: productBatchOne._id.toHexString(),
      };
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbProductBatch = await ProductBatch.findById(productBatchOne._id);
      expect(dbProductBatch).toBeDefined();
      expect(dbProductBatch.password).not.toBe(updateBody.password);
      expect(dbProductBatch).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProductBatchs([productBatchOne]);
      const updateBody = {
        product: faker.random.word(),
        warehouse: faker.random.word(),
        batchCode: faker.random.word(),
        manufactureDate: faker.random.word(),
        quantity: faker.random.number(),
        importPrice: faker.random.number(),
      };
      await request(app).patch(`/v1/productBatchs/${productBatchOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if productBatchId is not a valid mongo id', async () => {
      await insertProductBatchs([productBatchTwo]);
      const updateBody = {
        product: faker.random.word(),
        warehouse: faker.random.word(),
        batchCode: faker.random.word(),
        manufactureDate: faker.random.word(),
        quantity: faker.random.number(),
        importPrice: faker.random.number(),
      };
      await request(app)
        .patch(`/v1/productBatchs/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
