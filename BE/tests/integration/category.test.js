const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Category } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { categoryOne, categoryTwo, categoryThree, insertCategories } = require('../fixtures/category.fixture');

setupTestDB();

describe('Category routes', () => {
  describe('POST /v1/categories', () => {
    let newCategory;

    beforeEach(() => {
      newCategory = {
		code: faker.random.word(),
		name: faker.random.word(),
	};
    });

    test('should return 201 and successfully create new category if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);

      const res = await request(app)
        .post('/v1/categories')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newCategory)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newCategory.type });

      const dbCategory = await Category.findById(res.body.id);
      expect(dbCategory).toBeDefined();
      expect(dbCategory).toMatchObject({ type: newCategory.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/categories').send(newCategory).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/categories', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertCategories([categoryOne, categoryTwo]);

      const res = await request(app)
        .get('/v1/categories')
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
        id: categoryOne._id.toHexString()
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertCategories([categoryOne, categoryTwo]);

      await request(app).get('/v1/categories').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all categories', async () => {
      await insertCategories([categoryOne, categoryTwo]);

      await request(app)
        .get('/v1/categories')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertCategories([categoryOne, categoryTwo, categoryThree]);

      const res = await request(app)
        .get('/v1/categories')
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
      expect(res.body.results[0].id).toBe(categoryOne._id.toHexString());
      expect(res.body.results[1].id).toBe(categoryTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertCategories([categoryOne, categoryTwo, categoryThree]);

      const res = await request(app)
        .get('/v1/categories')
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

  describe('GET /v1/categories/:categoryId', () => {
    test('should return 200 and the category object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);

      const res = await request(app)
        .get(`/v1/categories/${categoryOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: categoryOne._id.toHexString()
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);

      await request(app).get(`/v1/categories/${categoryOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if categoryId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);

      await request(app)
        .get('/v1/categories/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if category is not found', async () => {
      await insertCategories([categoryTwo]);

      await request(app)
        .get(`/v1/categories/${categoryOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/categories/:categoryId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);

      await request(app)
        .delete(`/v1/categories/${categoryOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbCategory = await Category.findById(categoryOne._id);
      expect(dbCategory).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);

      await request(app).delete(`/v1/categories/${categoryOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if categoryId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);

      await request(app)
        .delete('/v1/categories/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if category already is not found', async () => {
      await insertCategories([categoryTwo]);

      await request(app)
        .delete(`/v1/categories/${categoryOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/categories/:categoryId', () => {
    test('should return 200 and successfully update category if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);
      const updateBody = {
		code: faker.random.word(),
		name: faker.random.word(),
	};

      const res = await request(app)
        .patch(`/v1/categories/${categoryOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      let validationData = {
        id: categoryOne._id.toHexString()
      }
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbCategory = await Category.findById(categoryOne._id);
      expect(dbCategory).toBeDefined();
      expect(dbCategory.password).not.toBe(updateBody.password);
      expect(dbCategory).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertCategories([categoryOne]);
      const updateBody = {
		code: faker.random.word(),
		name: faker.random.word(),
	};
      await request(app).patch(`/v1/categories/${categoryOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if categoryId is not a valid mongo id', async () => {
      await insertCategories([categoryTwo]);
      const updateBody = {
		code: faker.random.word(),
		name: faker.random.word(),
	};
      await request(app)
        .patch(`/v1/categories/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
