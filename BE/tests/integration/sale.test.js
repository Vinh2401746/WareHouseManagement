const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Sale } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { saleOne, saleTwo, saleThree, insertSales } = require('../fixtures/sale.fixture');

setupTestDB();

describe('Sale routes', () => {
  describe('POST /v1/sales', () => {
    let newSale;

    beforeEach(() => {
      newSale = {
        code: faker.random.word(),
        branch: faker.random.word(),
        warehouse: faker.random.word(),
        soldBy: faker.random.word(),
        saleDate: faker.random.word(),
        totalAmount: faker.random.word(),
        items: faker.random.word(),
      };
    });

    test('should return 201 and successfully create new sale if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);

      const res = await request(app)
        .post('/v1/sales')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newSale)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newSale.type });

      const dbSale = await Sale.findById(res.body.id);
      expect(dbSale).toBeDefined();
      expect(dbSale).toMatchObject({ type: newSale.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/sales').send(newSale).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/sales', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertSales([saleOne, saleTwo]);

      const res = await request(app)
        .get('/v1/sales')
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
        id: saleOne._id.toHexString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertSales([saleOne, saleTwo]);

      await request(app).get('/v1/sales').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all sales', async () => {
      await insertSales([saleOne, saleTwo]);

      await request(app)
        .get('/v1/sales')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertSales([saleOne, saleTwo, saleThree]);

      const res = await request(app)
        .get('/v1/sales')
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
      expect(res.body.results[0].id).toBe(saleOne._id.toHexString());
      expect(res.body.results[1].id).toBe(saleTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertSales([saleOne, saleTwo, saleThree]);

      const res = await request(app)
        .get('/v1/sales')
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

  describe('GET /v1/sales/:saleId', () => {
    test('should return 200 and the sale object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);

      const res = await request(app)
        .get(`/v1/sales/${saleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: saleOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);

      await request(app).get(`/v1/sales/${saleOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if saleId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);

      await request(app)
        .get('/v1/sales/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if sale is not found', async () => {
      await insertSales([saleTwo]);

      await request(app)
        .get(`/v1/sales/${saleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/sales/:saleId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);

      await request(app)
        .delete(`/v1/sales/${saleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSale = await Sale.findById(saleOne._id);
      expect(dbSale).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);

      await request(app).delete(`/v1/sales/${saleOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if saleId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);

      await request(app)
        .delete('/v1/sales/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if sale already is not found', async () => {
      await insertSales([saleTwo]);

      await request(app)
        .delete(`/v1/sales/${saleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/sales/:saleId', () => {
    test('should return 200 and successfully update sale if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);
      const updateBody = {
        code: faker.random.word(),
        branch: faker.random.word(),
        warehouse: faker.random.word(),
        soldBy: faker.random.word(),
        saleDate: faker.random.word(),
        totalAmount: faker.random.word(),
        items: faker.random.word(),
      };

      const res = await request(app)
        .patch(`/v1/sales/${saleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const validationData = {
        id: saleOne._id.toHexString(),
      };
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbSale = await Sale.findById(saleOne._id);
      expect(dbSale).toBeDefined();
      expect(dbSale.password).not.toBe(updateBody.password);
      expect(dbSale).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSales([saleOne]);
      const updateBody = {
        code: faker.random.word(),
        branch: faker.random.word(),
        warehouse: faker.random.word(),
        soldBy: faker.random.word(),
        saleDate: faker.random.word(),
        totalAmount: faker.random.word(),
        items: faker.random.word(),
      };
      await request(app).patch(`/v1/sales/${saleOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if saleId is not a valid mongo id', async () => {
      await insertSales([saleTwo]);
      const updateBody = {
        code: faker.random.word(),
        branch: faker.random.word(),
        warehouse: faker.random.word(),
        soldBy: faker.random.word(),
        saleDate: faker.random.word(),
        totalAmount: faker.random.word(),
        items: faker.random.word(),
      };
      await request(app)
        .patch(`/v1/sales/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
