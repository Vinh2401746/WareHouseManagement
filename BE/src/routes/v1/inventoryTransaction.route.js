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
  .delete(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.deleteInventoryTransaction),
    inventoryTransactionController.deleteInventoryTransaction
  );

router
  .route('/import/:inventoryTransactionId')
  .put(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.updateInventoryTransaction),
    inventoryTransactionController.updateInventoryTransaction
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: InventoryTransactions
 *   description: Quản lý và tra cứu giao dịch tồn kho (nhập/xuất)
 */

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Tạo giao dịch tồn kho
 *     description: Tạo phiếu nhập/xuất tồn kho thủ công.
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
 *               - type
 *               - warehouse
 *               - items
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [IMPORT, EXPORT]
 *                 description: Loại giao dịch
 *               reason:
 *                 type: string
 *                 description: Lý do giao dịch
 *               warehouse:
 *                 type: string
 *                 description: ID kho
 *               supplier:
 *                 type: string
 *                 description: ID nhà cung cấp (nếu nhập)
 *               sale:
 *                 type: string
 *                 description: ID đơn bán hàng (nếu xuất)
 *               createdBy:
 *                 type: string
 *                 description: ID người tạo
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *               deliveryPerson:
 *                 type: string
 *                 description: Người giao hàng
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     batch:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *             example:
 *               type: IMPORT
 *               reason: PURCHASE
 *               warehouse: 65a1b2c3d4e5f6a7b8c9d013
 *               supplier: 65a1b2c3d4e5f6a7b8c9d016
 *               deliveryPerson: Nguyễn Văn A
 *               items:
 *                 - product: 65a1b2c3d4e5f6a7b8c9d015
 *                   batch: 65a1b2c3d4e5f6a7b8c9d018
 *                   quantity: 10
 *                   price: 150000
 *     responses:
 *       "201":
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/InventoryTransaction'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Lấy danh sách giao dịch tồn kho
 *     description: Hỗ trợ lọc và phân trang.
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IMPORT, EXPORT]
 *         description: Loại giao dịch
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *         description: Lý do giao dịch
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: ID kho
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: string
 *         description: ID nhà cung cấp
 *       - in: query
 *         name: sale
 *         schema:
 *           type: string
 *         description: ID đơn bán hàng
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: ID người tạo
 *       - in: query
 *         name: transactionDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày giao dịch
 *       - in: query
 *         name: deliveryPerson
 *         schema:
 *           type: string
 *         description: Người giao hàng
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Số bản ghi tối đa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Trang hiện tại
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
 * /inventory/{inventoryTransactionId}:
 *   get:
 *     summary: Lấy chi tiết giao dịch tồn kho
 *     description: Theo ID giao dịch
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryTransactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID giao dịch tồn kho
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
 *   delete:
 *     summary: Xóa giao dịch tồn kho
 *     description: Xóa theo ID
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryTransactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID giao dịch tồn kho
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /inventory/import:
 *   post:
 *     summary: Nhập kho theo danh sách sản phẩm
 *     description: Tự tạo sản phẩm nếu chưa tồn tại, tạo lô và phiếu nhập.
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
 *               - warehouse
 *               - supplier
 *               - items
 *             properties:
 *               warehouse:
 *                 type: string
 *               supplier:
 *                 type: string
 *               reason:
 *                 type: string
 *               deliveryPerson:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productCode
 *                     - productName
 *                     - unit
 *                     - quantity
 *                     - price
 *                     - expiryDate
 *                     - category
 *                   properties:
 *                     productCode:
 *                       type: string
 *                     productName:
 *                       type: string
 *                     unit:
 *                       type: string
 *                     packaging:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                     category:
 *                       type: string
 *             example:
 *               warehouse: 65a1b2c3d4e5f6a7b8c9d013
 *               supplier: 65a1b2c3d4e5f6a7b8c9d016
 *               reason: PURCHASE
 *               deliveryPerson: Nguyễn Văn A
 *               items:
 *                 - productCode: PRD-001
 *                   productName: Nồi cơm điện
 *                   unit: cái
 *                   packaging: Hộp
 *                   quantity: 10
 *                   price: 150000
 *                   expiryDate: 2026-12-01
 *                   category: 65a1b2c3d4e5f6a7b8c9d014
 *     responses:
 *       "201":
 *         description: Tạo phiếu nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryTransaction'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Danh sách phiếu nhập
 *     description: Lấy danh sách giao dịch tồn kho (có thể lọc theo loại, kho, nhà cung cấp...)
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IMPORT, EXPORT]
 *         description: Loại giao dịch
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: ID kho
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: string
 *         description: ID nhà cung cấp
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số bản ghi
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
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /inventory/import/{inventoryTransactionId}:
 *   put:
 *     summary: Cập nhật phiếu nhập
 *     description: Cập nhật thông tin giao dịch nhập kho theo ID.
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryTransactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID giao dịch tồn kho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [IMPORT, EXPORT]
 *               reason:
 *                 type: string
 *               warehouse:
 *                 type: string
 *               supplier:
 *                 type: string
 *               sale:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               transactionDate:
 *                 type: string
 *                 format: date-time
 *               deliveryPerson:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     batch:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryTransaction'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
