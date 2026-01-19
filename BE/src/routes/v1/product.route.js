const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct)
  .get(auth('getProducts'), validate(productValidation.getProducts), productController.getProducts);

router
  .route('/:productId')
  .get(auth('getProducts'), validate(productValidation.getProduct), productController.getProduct)
  .put(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and retrieval
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product
 *     description: Can create products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - type
 *               - manufacturer
 *               - model
 *             properties:
 *               user:
 *                 type: string
 *               type:
 *                 type: string
 *                 description: product type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: product model (308, Demio, Aqua, etc...)
 *               numberplate:
 *                  type: string
 *               makeyear:
 *                  type: string
 *               registeryear:
 *                  type: string
 *               capacity:
 *                  type: string
 *               fuel:
 *                  type: string
 *               color:
 *                  type: string
 *             example:
 *               user: (User ID)
 *               type: car
 *               manufacturer: Mazda
 *               model: Demio
 *               numberplate: KM-1898
 *               makeyear: 2007
 *               registeryear: 2011
 *               capacity: 5
 *               fuel: Petrol
 *               color: Red
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Product'
 *       "400":
 *         $ref: '#/components/responses/Duplicate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User id
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product
 *     description: fetch Products by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Product'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a product
 *     description: Update products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               type:
 *                 type: string
 *                 description: product type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: product model (308, Demio, Aqua, etc...)
 *               numberplate:
 *                  type: string
 *               makeyear:
 *                  type: string
 *               registeryear:
 *                  type: string
 *               capacity:
 *                  type: string
 *               fuel:
 *                  type: string
 *               color:
 *                  type: string
 *             example:
 *               user: (User ID)
 *               type: car
 *               manufacturer: Mazda
 *               model: Demio
 *               numberplate: KM-1898
 *               makeyear: 2007
 *               registeryear: 2011
 *               capacity: 5
 *               fuel: Petrol
 *               color: Red
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Product'
 *       "400":
 *         $ref: '#/components/responses/Duplicate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a product
 *     description: Delete products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
