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
 *   description: Quản lý và tra cứu đơn bán hàng
 */

/**
 * @swagger
 * /sale:
 *   post:
 *     summary: Tạo đơn bán hàng
 *     description: Tạo mới đơn bán hàng.
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
 *               - branch
 *               - warehouse
 *               - items
 *             properties:
 *               branch:
 *                 type: string
 *                 description: ID chi nhánh
 *               warehouse:
 *                 type: string
 *                 description: ID kho
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product
 *                     - quantity
 *                     - price
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *             example:
 *               branch: 65a1b2c3d4e5f6a7b8c9d012
 *               warehouse: 65a1b2c3d4e5f6a7b8c9d013
 *               items:
 *                 - product: 65a1b2c3d4e5f6a7b8c9d015
 *                   quantity: 2
 *                   price: 150000
 *     responses:
 *       "201":
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Sale'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Lấy danh sách đơn bán hàng
 *     description: Hỗ trợ lọc và phân trang.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Mã đơn bán
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *         description: ID chi nhánh
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: ID kho
 *       - in: query
 *         name: soldBy
 *         schema:
 *           type: string
 *         description: ID người bán
 *       - in: query
 *         name: saleDate
 *         schema:
 *           type: string
 *         description: Ngày bán
 *       - in: query
 *         name: totalAmount
 *         schema:
 *           type: number
 *         description: Tổng tiền
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sắp xếp dạng field:asc|desc
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
 * /sale/{saleId}:
 *   get:
 *     summary: Lấy chi tiết đơn bán hàng
 *     description: Theo ID đơn bán
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đơn bán hàng
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
 *     summary: Cập nhật đơn bán hàng
 *     description: Cập nhật thông tin đơn bán theo ID.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đơn bán hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branch:
 *                 type: string
 *               warehouse:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *             example:
 *               items:
 *                 - product: 65a1b2c3d4e5f6a7b8c9d015
 *                   quantity: 3
 *                   price: 150000
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Sale'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Xóa đơn bán hàng
 *     description: Xóa theo ID đơn bán.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đơn bán hàng
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
