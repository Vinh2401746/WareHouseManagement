const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const inventoryTransactionValidation = require('../../validations/inventoryTransaction.validation');
const inventoryTransactionController = require('../../controllers/inventoryTransaction.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.createInventoryTransaction),
    inventoryTransactionController.createInventoryTransaction
  )
  .get(
    auth('getInventoryTransactions'),
    validate(inventoryTransactionValidation.getInventoryTransactions),
    inventoryTransactionController.getInventoryTransactions
  );
router
  .route('/import')
  .post(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.importInventory),
    inventoryTransactionController.importInventory
  );
router
  .route('/import')
  .get(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.getInventoryTransactions),
    inventoryTransactionController.getInventoryTransactions
  );
router
  .route('/:inventoryTransactionId')
  .get(
    auth('getInventoryTransactions'),
    validate(inventoryTransactionValidation.getInventoryTransaction),
    inventoryTransactionController.getInventoryTransaction
  )
  .patch(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.updateInventoryTransaction),
    inventoryTransactionController.updateInventoryTransaction
  )
  .delete(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.deleteInventoryTransaction),
    inventoryTransactionController.deleteInventoryTransaction
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: InventoryTransactions
 *   description: InventoryTransaction management and retrieval
 */

/**
 * @swagger
 * /inventoryTransactions:
 *   post:
 *     summary: Create a inventoryTransaction
 *     description: Can create inventoryTransactions.
 *     tags: [InventoryTransactions]
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
 *                 description: inventoryTransaction type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: inventoryTransaction model (308, Demio, Aqua, etc...)
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
 *                $ref: '#/components/schemas/InventoryTransaction'
 *       "400":
 *         $ref: '#/components/responses/Duplicate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all inventoryTransactions
 *     description: Retrieve all inventoryTransactions.
 *     tags: [InventoryTransactions]
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
 *         description: Maximum number of inventoryTransactions
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
 *                     $ref: '#/components/schemas/InventoryTransaction'
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
 * /inventoryTransactions/{id}:
 *   get:
 *     summary: Get a inventoryTransaction
 *     description: fetch InventoryTransactions by id
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: InventoryTransaction id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/InventoryTransaction'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a inventoryTransaction
 *     description: Update inventoryTransactions.
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: InventoryTransaction id
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
 *                 description: inventoryTransaction type (car, var, bike, etc...)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *                 description: inventoryTransaction model (308, Demio, Aqua, etc...)
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
 *                $ref: '#/components/schemas/InventoryTransaction'
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
 *     summary: Delete a inventoryTransaction
 *     description: Delete inventoryTransactions.
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: InventoryTransaction id
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
