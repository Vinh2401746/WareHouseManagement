const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const supplierValidation = require('../../validations/supplier.validation');
const supplierController = require('../../controllers/supplier.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageSuppliers'), validate(supplierValidation.createSupplier), supplierController.createSupplier)
  .get(auth('getSuppliers'), validate(supplierValidation.getSuppliers), supplierController.getSuppliers);

router
  .route('/:supplierId')
  .get(auth('getSuppliers'), validate(supplierValidation.getSupplier), supplierController.getSupplier)
  .put(auth('manageSuppliers'), validate(supplierValidation.updateSupplier), supplierController.updateSupplier)
  .delete(auth('manageSuppliers'), validate(supplierValidation.deleteSupplier), supplierController.deleteSupplier);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Supplier management and retrieval
 */

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create a supplier
 *     description: Can create suppliers.
 *     tags: [Suppliers]
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
 *                 description: supplier type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: supplier model (308, Demio, Aqua, etc...)
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
 *                $ref: '#/components/schemas/Supplier'
 *       "400":
 *         $ref: '#/components/responses/Duplicate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all suppliers
 *     description: Retrieve all suppliers.
 *     tags: [Suppliers]
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
 *         description: Maximum number of suppliers
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
 *                     $ref: '#/components/schemas/Supplier'
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
 * /suppliers/{id}:
 *   get:
 *     summary: Get a supplier
 *     description: fetch Suppliers by id
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Supplier'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a supplier
 *     description: Update suppliers.
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier id
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
 *                 description: supplier type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: supplier model (308, Demio, Aqua, etc...)
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
 *                $ref: '#/components/schemas/Supplier'
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
 *     summary: Delete a supplier
 *     description: Delete suppliers.
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier id
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
