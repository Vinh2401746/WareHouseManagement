const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Branch } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { branchOne, branchTwo, branchThree, insertBranchs } = require('../fixtures/branch.fixture');

setupTestDB();

describe('Branch routes', () => {
  describe('POST /v1/branches', () => {
    let newBranch;

    beforeEach(() => {
      newBranch = {
        name: faker.random.word(),
        address: faker.random.word(),
        phone: faker.random.word(),
      };
    });

    test('should return 201 and successfully create new branch if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      const res = await request(app)
        .post('/v1/branches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBranch)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newBranch.type });

      const dbBranch = await Branch.findById(res.body.id);
      expect(dbBranch).toBeDefined();
      expect(dbBranch).toMatchObject({ type: newBranch.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/branches').send(newBranch).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/branches', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertBranchs([branchOne, branchTwo]);

      const res = await request(app)
        .get('/v1/branches')
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
        id: branchOne._id.toHexString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertBranchs([branchOne, branchTwo]);

      await request(app).get('/v1/branches').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all branches', async () => {
      await insertBranchs([branchOne, branchTwo]);

      await request(app)
        .get('/v1/branches')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertBranchs([branchOne, branchTwo, branchThree]);

      const res = await request(app)
        .get('/v1/branches')
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
      expect(res.body.results[0].id).toBe(branchOne._id.toHexString());
      expect(res.body.results[1].id).toBe(branchTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertBranchs([branchOne, branchTwo, branchThree]);

      const res = await request(app)
        .get('/v1/branches')
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

  describe('GET /v1/branches/:branchId', () => {
    test('should return 200 and the branch object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      const res = await request(app)
        .get(`/v1/branches/${branchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: branchOne._id.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      await request(app).get(`/v1/branches/${branchOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if branchId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      await request(app)
        .get('/v1/branches/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if branch is not found', async () => {
      await insertBranchs([branchTwo]);

      await request(app)
        .get(`/v1/branches/${branchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/branches/:branchId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      await request(app)
        .delete(`/v1/branches/${branchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbBranch = await Branch.findById(branchOne._id);
      expect(dbBranch).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      await request(app).delete(`/v1/branches/${branchOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if branchId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);

      await request(app)
        .delete('/v1/branches/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if branch already is not found', async () => {
      await insertBranchs([branchTwo]);

      await request(app)
        .delete(`/v1/branches/${branchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/branches/:branchId', () => {
    test('should return 200 and successfully update branch if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      const updateBody = {
        name: faker.random.word(),
        address: faker.random.word(),
        phone: faker.random.word(),
      };

      const res = await request(app)
        .patch(`/v1/branches/${branchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      const validationData = {
        id: branchOne._id.toHexString(),
      };
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbBranch = await Branch.findById(branchOne._id);
      expect(dbBranch).toBeDefined();
      expect(dbBranch.password).not.toBe(updateBody.password);
      expect(dbBranch).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertBranchs([branchOne]);
      const updateBody = {
        name: faker.random.word(),
        address: faker.random.word(),
        phone: faker.random.word(),
      };
      await request(app).patch(`/v1/branches/${branchOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if branchId is not a valid mongo id', async () => {
      await insertBranchs([branchTwo]);
      const updateBody = {
        name: faker.random.word(),
        address: faker.random.word(),
        phone: faker.random.word(),
      };
      await request(app)
        .patch(`/v1/branches/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
