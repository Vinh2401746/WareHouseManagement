const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Supplier } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { supplierOne, supplierTwo, supplierThree, insertSuppliers } = require('../fixtures/supplier.fixture');

setupTestDB();

describe('Supplier routes', () => {
  describe('POST /v1/suppliers', () => {
    let newSupplier;

    beforeEach(() => {
      newSupplier = {
        name: faker.random.word(),
        phone: faker.random.word(),
        email: faker.random.word(),
        address: faker.random.word(),
      };
    });

    test('should return 201 and successfully create new supplier if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);

      const res = await request(app)
        .post('/v1/suppliers')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newSupplier)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newSupplier.type });

      const dbSupplier = await Supplier.findById(res.body.id);
      expect(dbSupplier).toBeDefined();
      expect(dbSupplier).toMatchObject({ type: newSupplier.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/suppliers').send(newSupplier).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/suppliers', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertSuppliers([supplierOne, supplierTwo]);

      const res = await request(app)
        .get('/v1/suppliers')
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
        id: supplierOne._id.toHexString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertSuppliers([supplierOne, supplierTwo]);

      await request(app).get('/v1/suppliers').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all suppliers', async () => {
      await insertSuppliers([supplierOne, supplierTwo]);

      await request(app)
        .get('/v1/suppliers')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertSuppliers([supplierOne, supplierTwo, supplierThree]);

      const res = await request(app)
        .get('/v1/suppliers')
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
      expect(res.body.results[0].id).toBe(supplierOne._id.toHexString());
      expect(res.body.results[1].id).toBe(supplierTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertSuppliers([supplierOne, supplierTwo, supplierThree]);

      const res = await request(app)
        .get('/v1/suppliers')
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

  describe('GET /v1/suppliers/:supplierId', () => {
    test('should return 200 and the supplier object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);

      const res = await request(app)
        .get(`/v1/suppliers/${supplierOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: supplierOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);

      await request(app).get(`/v1/suppliers/${supplierOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if supplierId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);

      await request(app)
        .get('/v1/suppliers/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if supplier is not found', async () => {
      await insertSuppliers([supplierTwo]);

      await request(app)
        .get(`/v1/suppliers/${supplierOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/suppliers/:supplierId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);

      await request(app)
        .delete(`/v1/suppliers/${supplierOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSupplier = await Supplier.findById(supplierOne._id);
      expect(dbSupplier).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);

      await request(app).delete(`/v1/suppliers/${supplierOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if supplierId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);

      await request(app)
        .delete('/v1/suppliers/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if supplier already is not found', async () => {
      await insertSuppliers([supplierTwo]);

      await request(app)
        .delete(`/v1/suppliers/${supplierOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/suppliers/:supplierId', () => {
    test('should return 200 and successfully update supplier if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);
      const updateBody = {
        name: faker.random.word(),
        phone: faker.random.word(),
        email: faker.random.word(),
        address: faker.random.word(),
      };

      const res = await request(app)
        .patch(`/v1/suppliers/${supplierOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const validationData = {
        id: supplierOne._id.toHexString(),
      };
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbSupplier = await Supplier.findById(supplierOne._id);
      expect(dbSupplier).toBeDefined();
      expect(dbSupplier.password).not.toBe(updateBody.password);
      expect(dbSupplier).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertSuppliers([supplierOne]);
      const updateBody = {
        name: faker.random.word(),
        phone: faker.random.word(),
        email: faker.random.word(),
        address: faker.random.word(),
      };
      await request(app).patch(`/v1/suppliers/${supplierOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if supplierId is not a valid mongo id', async () => {
      await insertSuppliers([supplierTwo]);
      const updateBody = {
        name: faker.random.word(),
        phone: faker.random.word(),
        email: faker.random.word(),
        address: faker.random.word(),
      };
      await request(app)
        .patch(`/v1/suppliers/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
