const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productBatchValidation = require('../../validations/productBatch.validation');
const productBatchController = require('../../controllers/productBatch.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageProductBatchs'),
    validate(productBatchValidation.createProductBatch),
    productBatchController.createProductBatch
  )
  .get(auth('getProductBatchs'), validate(productBatchValidation.getProductBatchs), productBatchController.getProductBatchs);

router
  .route('/:productBatchId')
  .get(auth('getProductBatchs'), validate(productBatchValidation.getProductBatch), productBatchController.getProductBatch)
  .put(
    auth('manageProductBatchs'),
    validate(productBatchValidation.updateProductBatch),
    productBatchController.updateProductBatch
  )
  .delete(
    auth('manageProductBatchs'),
    validate(productBatchValidation.deleteProductBatch),
    productBatchController.deleteProductBatch
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ProductBatchs
 *   description: Quản lý và tra cứu lô sản phẩm
 */

/**
 * @swagger
 * /productBatch:
 *   post:
 *     summary: Tạo lô sản phẩm
 *     description: Tạo mới lô sản phẩm.
 *     tags: [ProductBatchs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - warehouse
 *               - expiryDate
 *               - quantity
 *               - importPrice
 *             properties:
 *               product:
 *                 type: string
 *                 description: ID sản phẩm
 *               warehouse:
 *                 type: string
 *                 description: ID kho
 *               batchCode:
 *                 type: string
 *                 description: Mã lô (tùy chọn)
 *               manufactureDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               importPrice:
 *                 type: number
 *             example:
 *               product: 65a1b2c3d4e5f6a7b8c9d015
 *               warehouse: 65a1b2c3d4e5f6a7b8c9d013
 *               batchCode: B20260204-ABC123
 *               manufactureDate: 2025-12-01
 *               expiryDate: 2026-12-01
 *               quantity: 100
 *               importPrice: 150000
 *     responses:
 *       "201":
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ProductBatch'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Lấy danh sách lô sản phẩm
 *     description: Hỗ trợ lọc và phân trang.
 *     tags: [ProductBatchs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: ID kho
 *       - in: query
 *         name: batchCode
 *         schema:
 *           type: string
 *         description: Mã lô
 *       - in: query
 *         name: manufactureDate
 *         schema:
 *           type: string
 *         description: Ngày sản xuất
 *       - in: query
 *         name: expiryDate
 *         schema:
 *           type: string
 *         description: Ngày hết hạn
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: number
 *         description: Số lượng
 *       - in: query
 *         name: importPrice
 *         schema:
 *           type: number
 *         description: Giá nhập
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
 *                     $ref: '#/components/schemas/ProductBatch'
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
 * /productBatch/{productBatchId}:
 *   get:
 *     summary: Lấy chi tiết lô sản phẩm
 *     description: Theo ID lô sản phẩm
 *     tags: [ProductBatchs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productBatchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lô sản phẩm
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ProductBatch'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Cập nhật lô sản phẩm
 *     description: Cập nhật thông tin lô theo ID.
 *     tags: [ProductBatchs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productBatchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lô sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               warehouse:
 *                 type: string
 *               batchCode:
 *                 type: string
 *               manufactureDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               importPrice:
 *                 type: number
 *             example:
 *               quantity: 120
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ProductBatch'
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
 *     summary: Xóa lô sản phẩm
 *     description: Xóa theo ID lô sản phẩm.
 *     tags: [ProductBatchs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productBatchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lô sản phẩm
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
