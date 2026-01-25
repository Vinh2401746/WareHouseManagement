const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const saleValidation = require('../../validations/sale.validation');
const saleController = require('../../controllers/sale.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageSales'), validate(saleValidation.createSale), saleController.createSale)
  .get(auth('getSales'), validate(saleValidation.getSales), saleController.getSales);

router
  .route('/:saleId')
  .get(auth('getSales'), validate(saleValidation.getSale), saleController.getSale)
  .patch(auth('manageSales'), validate(saleValidation.updateSale), saleController.updateSale)
  .delete(auth('manageSales'), validate(saleValidation.deleteSale), saleController.deleteSale);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sale management and retrieval
 */

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a sale
 *     description: Can create sales.
 *     tags: [Sales]
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
 *                 description: sale type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: sale model (308, Demio, Aqua, etc...)
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
 *                $ref: '#/components/schemas/Sale'
 *       "400":
 *         $ref: '#/components/responses/Duplicate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all sales
 *     description: Retrieve all sales.
 *     tags: [Sales]
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
 *         description: Maximum number of sales
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
 *                     $ref: '#/components/schemas/Sale'
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
 * /sales/{id}:
 *   get:
 *     summary: Get a sale
 *     description: fetch Sales by id
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Sale'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a sale
 *     description: Update sales.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale id
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
 *                 description: sale type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: sale model (308, Demio, Aqua, etc...)
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
 *                $ref: '#/components/schemas/Sale'
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
 *     summary: Delete a sale
 *     description: Delete sales.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale id
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
