const mongoose = require('mongoose');
const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Warehouse } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { warehouseOne, warehouseTwo, warehouseThree, insertWarehouses } = require('../fixtures/warehouse.fixture');
const { branchOne, branchTwo, insertBranchs } = require('../fixtures/branch.fixture');

setupTestDB();

const expectWarehouseResponse = (payload, warehouse, branch) => {
  expect(payload).toEqual(
    expect.objectContaining({
      id: warehouse._id.toHexString(),
      name: warehouse.name,
      address: warehouse.address,
      branch: expect.objectContaining({
        id: branch._id.toHexString(),
        name: branch.name,
      }),
    })
  );
};

describe('Warehouse routes', () => {
  describe('POST /v1/warehouse', () => {
    let newWarehouse;

    beforeEach(() => {
      newWarehouse = {
        name: faker.random.word(),
        branch: branchOne._id.toHexString(),
        address: faker.random.word(),
      };
    });

    test('should return 201 and successfully create new warehouse if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      const res = await request(app)
        .post('/v1/warehouse')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newWarehouse)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: newWarehouse.name,
          branch: newWarehouse.branch,
          address: newWarehouse.address,
        })
      );

      const dbWarehouse = await Warehouse.findById(res.body.id).lean();
      expect(dbWarehouse).toMatchObject({
        name: newWarehouse.name,
        address: newWarehouse.address,
      });
      expect(dbWarehouse.branch.toHexString()).toBe(newWarehouse.branch);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/warehouse').send(newWarehouse).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/warehouse', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertBranchs([branchOne, branchTwo]);
      await insertWarehouses([warehouseOne, warehouseTwo]);

      const res = await request(app)
        .get('/v1/warehouse')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: warehouseOne._id.toHexString(),
            branch: expect.objectContaining({ id: branchOne._id.toHexString() }),
          }),
          expect.objectContaining({
            id: warehouseTwo._id.toHexString(),
            branch: expect.objectContaining({ id: branchOne._id.toHexString() }),
          }),
        ])
      );
    });

    test('should return 401 if access token is missing', async () => {
      await insertBranchs([branchOne, branchTwo]);
      await insertWarehouses([warehouseOne, warehouseTwo]);

      await request(app).get('/v1/warehouse').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should scope results to the requester branch for non-admin roles', async () => {
      await insertBranchs([branchOne, branchTwo]);
      await insertWarehouses([warehouseOne, warehouseTwo, warehouseThree]);

      const res = await request(app)
        .get('/v1/warehouse')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      res.body.results.forEach((warehouse) => {
        expect(warehouse.branch.id).toBe(branchOne._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertBranchs([branchOne, branchTwo]);
      const scopedWarehouse = {
        _id: mongoose.Types.ObjectId(),
        name: faker.random.word(),
        branch: branchOne._id,
        address: faker.random.word(),
      };
      await insertWarehouses([warehouseOne, warehouseTwo, scopedWarehouse]);

      const res = await request(app)
        .get('/v1/warehouse')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertBranchs([branchOne, branchTwo]);
      const scopedWarehouse = {
        _id: mongoose.Types.ObjectId(),
        name: faker.random.word(),
        branch: branchOne._id,
        address: faker.random.word(),
      };
      await insertWarehouses([warehouseOne, warehouseTwo, scopedWarehouse]);

      const res = await request(app)
        .get('/v1/warehouse')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(scopedWarehouse._id.toHexString());
    });
  });

  describe('GET /v1/warehouse/:warehouseId', () => {
    test('should return 200 and the warehouse object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);

      const res = await request(app)
        .get(`/v1/warehouse/${warehouseOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expectWarehouseResponse(res.body, warehouseOne, branchOne);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);

      await request(app).get(`/v1/warehouse/${warehouseOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if warehouseId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);

      await request(app)
        .get('/v1/warehouse/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if warehouse is not found', async () => {
      await insertBranchs([branchTwo]);
      await insertWarehouses([warehouseTwo]);

      await request(app)
        .get(`/v1/warehouse/${warehouseOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/warehouse/:warehouseId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);

      await request(app)
        .delete(`/v1/warehouse/${warehouseOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbWarehouse = await Warehouse.findById(warehouseOne._id);
      expect(dbWarehouse).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);

      await request(app).delete(`/v1/warehouse/${warehouseOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if warehouseId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);

      await request(app)
        .delete('/v1/warehouse/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if warehouse already is not found', async () => {
      await insertBranchs([branchTwo]);
      await insertWarehouses([warehouseTwo]);

      await request(app)
        .delete(`/v1/warehouse/${warehouseOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PUT /v1/warehouse/:warehouseId', () => {
    test('should return 200 and successfully update warehouse if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);
      const updateBody = {
        name: faker.random.word(),
        address: faker.random.word(),
      };

      const res = await request(app)
        .put(`/v1/warehouse/${warehouseOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: warehouseOne._id.toHexString(),
          name: updateBody.name,
          address: updateBody.address,
        })
      );
      expect(res.body.branch).toEqual(expect.objectContaining({ id: branchOne._id.toHexString() }));

      const dbWarehouse = await Warehouse.findById(warehouseOne._id).lean();
      expect(dbWarehouse).toMatchObject(updateBody);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      await insertWarehouses([warehouseOne]);
      const updateBody = {
        name: faker.random.word(),
        address: faker.random.word(),
      };
      await request(app).put(`/v1/warehouse/${warehouseOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if warehouseId is not a valid mongo id', async () => {
      await insertBranchs([branchTwo]);
      await insertWarehouses([warehouseTwo]);
      const updateBody = {
        name: faker.random.word(),
        address: faker.random.word(),
      };
      await request(app)
        .put(`/v1/warehouse/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
