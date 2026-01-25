const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { InventoryTransaction } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { inventoryTransactionOne, inventoryTransactionTwo, inventoryTransactionThree, insertInventoryTransactions } = require('../fixtures/inventoryTransaction.fixture');

setupTestDB();

describe('InventoryTransaction routes', () => {
  describe('POST /v1/inventoryTransactions', () => {
    let newInventoryTransaction;

    beforeEach(() => {
      newInventoryTransaction = {
		type: faker.random.word(),
		reason: faker.random.word(),
		warehouse: faker.random.word(),
		supplier: faker.random.word(),
		sale: faker.random.word(),
		createdBy: faker.random.word(),
		transactionDate: faker.random.word(),
		items: faker.random.word(),
	};
    });

    test('should return 201 and successfully create new inventoryTransaction if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);

      const res = await request(app)
        .post('/v1/inventoryTransactions')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newInventoryTransaction)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newInventoryTransaction.type });

      const dbInventoryTransaction = await InventoryTransaction.findById(res.body.id);
      expect(dbInventoryTransaction).toBeDefined();
      expect(dbInventoryTransaction).toMatchObject({ type: newInventoryTransaction.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/inventoryTransactions').send(newInventoryTransaction).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/inventoryTransactions', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertInventoryTransactions([inventoryTransactionOne, inventoryTransactionTwo]);

      const res = await request(app)
        .get('/v1/inventoryTransactions')
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
        id: inventoryTransactionOne._id.toHexString()
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertInventoryTransactions([inventoryTransactionOne, inventoryTransactionTwo]);

      await request(app).get('/v1/inventoryTransactions').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all inventoryTransactions', async () => {
      await insertInventoryTransactions([inventoryTransactionOne, inventoryTransactionTwo]);

      await request(app)
        .get('/v1/inventoryTransactions')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertInventoryTransactions([inventoryTransactionOne, inventoryTransactionTwo, inventoryTransactionThree]);

      const res = await request(app)
        .get('/v1/inventoryTransactions')
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
      expect(res.body.results[0].id).toBe(inventoryTransactionOne._id.toHexString());
      expect(res.body.results[1].id).toBe(inventoryTransactionTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertInventoryTransactions([inventoryTransactionOne, inventoryTransactionTwo, inventoryTransactionThree]);

      const res = await request(app)
        .get('/v1/inventoryTransactions')
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

  describe('GET /v1/inventoryTransactions/:inventoryTransactionId', () => {
    test('should return 200 and the inventoryTransaction object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);

      const res = await request(app)
        .get(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: inventoryTransactionOne._id.toHexString()
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);

      await request(app).get(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if inventoryTransactionId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);

      await request(app)
        .get('/v1/inventoryTransactions/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if inventoryTransaction is not found', async () => {
      await insertInventoryTransactions([inventoryTransactionTwo]);

      await request(app)
        .get(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/inventoryTransactions/:inventoryTransactionId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);

      await request(app)
        .delete(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbInventoryTransaction = await InventoryTransaction.findById(inventoryTransactionOne._id);
      expect(dbInventoryTransaction).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);

      await request(app).delete(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if inventoryTransactionId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);

      await request(app)
        .delete('/v1/inventoryTransactions/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if inventoryTransaction already is not found', async () => {
      await insertInventoryTransactions([inventoryTransactionTwo]);

      await request(app)
        .delete(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/inventoryTransactions/:inventoryTransactionId', () => {
    test('should return 200 and successfully update inventoryTransaction if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);
      const updateBody = {
		type: faker.random.word(),
		reason: faker.random.word(),
		warehouse: faker.random.word(),
		supplier: faker.random.word(),
		sale: faker.random.word(),
		createdBy: faker.random.word(),
		transactionDate: faker.random.word(),
		items: faker.random.word(),
	};

      const res = await request(app)
        .patch(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      let validationData = {
        id: inventoryTransactionOne._id.toHexString()
      }
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbInventoryTransaction = await InventoryTransaction.findById(inventoryTransactionOne._id);
      expect(dbInventoryTransaction).toBeDefined();
      expect(dbInventoryTransaction.password).not.toBe(updateBody.password);
      expect(dbInventoryTransaction).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertInventoryTransactions([inventoryTransactionOne]);
      const updateBody = {
		type: faker.random.word(),
		reason: faker.random.word(),
		warehouse: faker.random.word(),
		supplier: faker.random.word(),
		sale: faker.random.word(),
		createdBy: faker.random.word(),
		transactionDate: faker.random.word(),
		items: faker.random.word(),
	};
      await request(app).patch(`/v1/inventoryTransactions/${inventoryTransactionOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if inventoryTransactionId is not a valid mongo id', async () => {
      await insertInventoryTransactions([inventoryTransactionTwo]);
      const updateBody = {
		type: faker.random.word(),
		reason: faker.random.word(),
		warehouse: faker.random.word(),
		supplier: faker.random.word(),
		sale: faker.random.word(),
		createdBy: faker.random.word(),
		transactionDate: faker.random.word(),
		items: faker.random.word(),
	};
      await request(app)
        .patch(`/v1/inventoryTransactions/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
