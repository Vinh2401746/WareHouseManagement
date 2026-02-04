const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const warehouseValidation = require('../../validations/warehouse.validation');
const warehouseController = require('../../controllers/warehouse.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageWarehouses'), validate(warehouseValidation.createWarehouse), warehouseController.createWarehouse)
  .get(auth('getWarehouses'), validate(warehouseValidation.getWarehouses), warehouseController.getWarehouses);

router
  .route('/:warehouseId')
  .get(auth('getWarehouses'), validate(warehouseValidation.getWarehouse), warehouseController.getWarehouse)
  .put(auth('manageWarehouses'), validate(warehouseValidation.updateWarehouse), warehouseController.updateWarehouse)
  .delete(auth('manageWarehouses'), validate(warehouseValidation.deleteWarehouse), warehouseController.deleteWarehouse);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Quản lý và tra cứu kho
 */

/**
 * @swagger
 * /warehouse:
 *   post:
 *     summary: Tạo kho
 *     description: Tạo mới kho.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - branch
 *             properties:
 *               name:
 *                 type: string
 *               branch:
 *                 type: string
 *                 description: ID chi nhánh
 *               address:
 *                 type: string
 *             example:
 *               name: Kho Trung Tâm
 *               branch: 65a1b2c3d4e5f6a7b8c9d012
 *               address: 456 Đường B, Hà Nội
 *     responses:
 *       "201":
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Warehouse'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Lấy danh sách kho
 *     description: Hỗ trợ lọc và phân trang.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tên kho
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *         description: ID chi nhánh
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Địa chỉ
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
 *                     $ref: '#/components/schemas/Warehouse'
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
 * /warehouse/{warehouseId}:
 *   get:
 *     summary: Lấy chi tiết kho
 *     description: Theo ID kho
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kho
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Warehouse'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Cập nhật kho
 *     description: Cập nhật thông tin kho theo ID.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               branch:
 *                 type: string
 *               address:
 *                 type: string
 *             example:
 *               address: 789 Đường C, Hà Nội
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Warehouse'
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
 *     summary: Xóa kho
 *     description: Xóa theo ID kho.
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kho
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
