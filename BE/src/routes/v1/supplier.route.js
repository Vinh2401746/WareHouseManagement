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
 *   description: Quản lý và tra cứu nhà cung cấp
 */

/**
 * @swagger
 * /supplier:
 *   post:
 *     summary: Tạo nhà cung cấp
 *     description: Tạo mới nhà cung cấp.
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *             example:
 *               name: Nhà cung cấp ABC
 *               phone: "0987654321"
 *               email: supplier@abc.com
 *               address: 789 Đường C, Hà Nội
 *     responses:
 *       "201":
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Supplier'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Lấy danh sách nhà cung cấp
 *     description: Hỗ trợ lọc và phân trang.
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tên nhà cung cấp
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Số điện thoại
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email
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
 * /supplier/{supplierId}:
 *   get:
 *     summary: Lấy chi tiết nhà cung cấp
 *     description: Theo ID nhà cung cấp
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID nhà cung cấp
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
 *   put:
 *     summary: Cập nhật nhà cung cấp
 *     description: Cập nhật thông tin nhà cung cấp theo ID.
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID nhà cung cấp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *             example:
 *               phone: "0987654321"
 *               address: 456 Đường B, Hà Nội
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Supplier'
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
 *     summary: Xóa nhà cung cấp
 *     description: Xóa theo ID nhà cung cấp.
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID nhà cung cấp
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
