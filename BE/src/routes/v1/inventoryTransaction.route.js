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

router
  .route('/import/:inventoryTransactionId/confirm')
  .patch(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.confirmImport),
    inventoryTransactionController.confirmImport
  );

router
  .route('/import/:inventoryTransactionId/cancel')
  .put(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.cancelImport),
    inventoryTransactionController.cancelImport
  );

router
  .route('/import/:inventoryTransactionId/status')
  .patch(
    auth('manageInventoryTransactions'),
    validate(inventoryTransactionValidation.changeImportStatus),
    inventoryTransactionController.changeImportStatus
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
 *     description: Tự tạo sản phẩm nếu chưa tồn tại, tạo lô và phiếu nhập. Phiếu tạo mặc định ở trạng thái PENDING.
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
 *                 description: ID kho
 *               supplier:
 *                 type: string
 *                 description: ID nhà cung cấp
 *               reason:
 *                 type: string
 *                 description: Lý do nhập kho
 *               deliveryPerson:
 *                 type: string
 *                 description: Người giao hàng
 *               totalAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Tổng tiền hàng trước thuế/CK
 *               discountMoney:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 description: Tiền chiết khấu
 *               taxMoney:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 description: Tiền thuế
 *               totalAmountAfterFax:
 *                 type: number
 *                 minimum: 0
 *                 description: Tổng tiền sau thuế và chiết khấu
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productCode
 *                     - productName
 *                     - unit
 *                     - quantity
 *                     - price
 *                     - expiryDate
 *                   properties:
 *                     productCode:
 *                       type: string
 *                       description: Mã sản phẩm
 *                     productName:
 *                       type: string
 *                       description: Tên sản phẩm
 *                     unit:
 *                       type: string
 *                       description: ID đơn vị tính
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Số lượng
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       description: Đơn giá nhập
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                       description: Ngày hết hạn
 *             example:
 *               warehouse: 65a1b2c3d4e5f6a7b8c9d013
 *               supplier: 65a1b2c3d4e5f6a7b8c9d016
 *               reason: Mua hàng
 *               deliveryPerson: Nguyễn Văn A
 *               totalAmount: 2500000
 *               discountMoney: 50000
 *               taxMoney: 196000
 *               totalAmountAfterFax: 2646000
 *               items:
 *                 - productCode: PRD-001
 *                   productName: Nồi cơm điện
 *                   unit: 65a1b2c3d4e5f6a7b8c9d020
 *                   packaging: Hộp
 *                   quantity: 10
 *                   price: 150000
 *                   expiryDate: 2026-12-01
 *                 - productCode: PRD-002
 *                   productName: Ấm siêu tốc
 *                   unit: 65a1b2c3d4e5f6a7b8c9d020
 *                   packaging: Hộp
 *                   quantity: 5
 *                   price: 200000
 *                   expiryDate: 2027-06-15
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

/**
 * @swagger
 * /inventory/import/{inventoryTransactionId}/confirm:
 *   patch:
 *     summary: Xác nhận phiếu nhập kho
 *     description: Chuyển trạng thái phiếu nhập từ PENDING sang COMPLETED.
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryTransactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phiếu nhập kho
 *     responses:
 *       "200":
 *         description: Xác nhận thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryTransaction'
 *       "400":
 *         description: Phiếu đã xác nhận hoặc đã hủy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Phiếu nhập đã được xác nhận trước đó
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /inventory/import/{inventoryTransactionId}/cancel:
 *   patch:
 *     summary: Hủy phiếu nhập kho
 *     description: Chuyển trạng thái phiếu nhập từ PENDING sang CANCELED. Tồn kho trong lô (ProductBatch) sẽ được hoàn trả.
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryTransactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phiếu nhập kho
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelReason:
 *                 type: string
 *                 description: Lý do hủy phiếu (tùy chọn)
 *           example:
 *             cancelReason: Hàng lỗi, trả lại nhà cung cấp
 *     responses:
 *       "200":
 *         description: Hủy thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryTransaction'
 *       "400":
 *         description: Không thể hủy phiếu đã xác nhận hoặc đã hủy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Không thể hủy phiếu nhập đã xác nhận
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /inventory/import/{inventoryTransactionId}/status:
 *   patch:
 *     summary: Thay đổi trạng thái phiếu nhập kho
 *     description: |
 *       Chuyển trạng thái phiếu nhập theo quy tắc:
 *       - PENDING → COMPLETED hoặc CANCELED
 *       - COMPLETED → không cho phép chuyển
 *       - CANCELED → không cho phép chuyển
 *
 *       Nếu chuyển sang CANCELED, tồn kho trong lô sẽ được hoàn trả tự động.
 *     tags: [InventoryTransactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryTransactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phiếu nhập kho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELED]
 *                 description: Trạng thái mới
 *           example:
 *             status: COMPLETED
 *     responses:
 *       "200":
 *         description: Chuyển trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryTransaction'
 *       "400":
 *         description: Không thể chuyển trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Không thể chuyển trạng thái từ COMPLETED sang PENDING"
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
