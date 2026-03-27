const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Unit } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { unitOne, unitTwo, unitThree, insertUnits } = require('../fixtures/unit.fixture');

setupTestDB();

describe('Unit routes', () => {
  describe('POST /v1/unit', () => {
    let newUnit;

    beforeEach(() => {
      newUnit = {
        code: faker.random.word(),
        name: faker.random.word(),
      };
    });

    test('should return 201 and successfully create new unit if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);

      const res = await request(app)
        .post('/v1/unit')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUnit)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newUnit.type });

      const dbUnit = await Unit.findById(res.body.id);
      expect(dbUnit).toBeDefined();
      expect(dbUnit).toMatchObject({ type: newUnit.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/unit').send(newUnit).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/unit', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUnits([unitOne, unitTwo]);

      const res = await request(app)
        .get('/v1/unit')
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
        id: unitOne._id.toHexString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertUnits([unitOne, unitTwo]);

      await request(app).get('/v1/unit').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all units', async () => {
      await insertUnits([unitOne, unitTwo]);

      await request(app)
        .get('/v1/unit')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUnits([unitOne, unitTwo, unitThree]);

      const res = await request(app)
        .get('/v1/unit')
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
      expect(res.body.results[0].id).toBe(unitOne._id.toHexString());
      expect(res.body.results[1].id).toBe(unitTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUnits([unitOne, unitTwo, unitThree]);

      const res = await request(app)
        .get('/v1/unit')
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

  describe('GET /v1/unit/:unitId', () => {
    test('should return 200 and the unit object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);

      const res = await request(app)
        .get(`/v1/unit/${unitOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: unitOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);

      await request(app).get(`/v1/unit/${unitOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if unitId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);

      await request(app)
        .get('/v1/unit/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if unit is not found', async () => {
      await insertUnits([unitTwo]);

      await request(app)
        .get(`/v1/unit/${unitOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/unit/:unitId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);

      await request(app)
        .delete(`/v1/unit/${unitOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUnit = await Unit.findById(unitOne._id);
      expect(dbUnit).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);

      await request(app).delete(`/v1/unit/${unitOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if unitId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);

      await request(app)
        .delete('/v1/unit/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if unit already is not found', async () => {
      await insertUnits([unitTwo]);

      await request(app)
        .delete(`/v1/unit/${unitOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/unit/:unitId', () => {
    test('should return 200 and successfully update unit if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);
      const updateBody = {
        code: faker.random.word(),
        name: faker.random.word(),
      };

      const res = await request(app)
        .patch(`/v1/unit/${unitOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const validationData = {
        id: unitOne._id.toHexString(),
      };
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbUnit = await Unit.findById(unitOne._id);
      expect(dbUnit).toBeDefined();
      expect(dbUnit.password).not.toBe(updateBody.password);
      expect(dbUnit).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertUnits([unitOne]);
      const updateBody = {
        code: faker.random.word(),
        name: faker.random.word(),
      };
      await request(app).patch(`/v1/unit/${unitOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if unitId is not a valid mongo id', async () => {
      await insertUnits([unitTwo]);
      const updateBody = {
        code: faker.random.word(),
        name: faker.random.word(),
      };
      await request(app)
        .patch(`/v1/unit/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
