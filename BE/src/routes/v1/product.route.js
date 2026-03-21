const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');
const uploadProductImage = require('../../middlewares/uploadImage');
const normalizeProductPayload = require('../../middlewares/normalizeProductPayload');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');

const router = express.Router();

// ─── Excel Import / Export (phải đặt TRƯỚC /:productId) ──────────────────────

router.get('/import-template', auth('getProducts'), productController.getImportTemplate);

router.post('/import', auth('manageProducts'), upload.single('file'), productController.importProducts);

router.get('/export', auth('getProducts'), validate(productValidation.exportProducts), productController.exportProducts);

// ─── CRUD ─────────────────────────────────────────────────────────────────────

router
  .route('/')
  .post(
    auth('manageProducts'),
    uploadProductImage,
    normalizeProductPayload,
    validate(productValidation.createProduct),
    productController.createProduct
  )
  .get(auth('getProducts'), validate(productValidation.getProducts), productController.getProducts);

router
  .route('/:productId')
  .get(auth('getProducts'), validate(productValidation.getProduct), productController.getProduct)
  .put(
    auth('manageProducts'),
    uploadProductImage,
    normalizeProductPayload,
    validate(productValidation.updateProduct),
    productController.updateProduct
  )
  .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Quản lý và tra cứu sản phẩm
 */

/**
 * @swagger
 * /product/import-template:
 *   get:
 *     summary: Tải file mẫu nhập sản phẩm
 *     description: |
 *       Tải xuống file Excel mẫu (.xlsx) để điền thông tin sản phẩm và import lên hệ thống.
 *
 *       File mẫu gồm:
 *       - **Header row** (xanh đậm): Mã SP | Tên SP | Đơn vị | Tồn tối thiểu | Quy cách
 *       - **2 dòng dữ liệu mẫu** (nền vàng — xóa trước khi nhập thật)
 *       - **Dòng ghi chú** (chữ đỏ) hướng dẫn từng cột
 *
 *       Sau khi điền xong, upload file qua `POST /product/import`.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: File Excel mẫu tải về thành công
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: 'attachment; filename="product_import_template.xlsx"'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /product/import:
 *   post:
 *     summary: Nhập sản phẩm từ file Excel
 *     description: |
 *       Upload file Excel (.xlsx, .xls) để nhập hàng loạt sản phẩm.
 *       - Nếu mã sản phẩm đã tồn tại → **cập nhật** thông tin
 *       - Nếu mã sản phẩm chưa tồn tại → **tạo mới**
 *       - Cột **Đơn vị** phải khớp tên đơn vị đã có trong hệ thống
 *       - Dòng lỗi sẽ được ghi nhận trong trường `errors`
 *
 *       **Cấu trúc file Excel (header row 1):**
 *       | Mã SP | Tên SP | Đơn vị | Tồn tối thiểu | Quy cách |
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File Excel (.xlsx hoặc .xls), tối đa 5MB
 *     responses:
 *       "200":
 *         description: Nhập thành công (có thể kèm theo lỗi từng dòng)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imported:
 *                   type: integer
 *                   description: Số sản phẩm được tạo mới
 *                   example: 5
 *                 updated:
 *                   type: integer
 *                   description: Số sản phẩm được cập nhật
 *                   example: 2
 *                 errors:
 *                   type: array
 *                   description: Danh sách dòng lỗi (nếu có)
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                         description: Số thứ tự dòng trong file Excel
 *                         example: 3
 *                       code:
 *                         type: string
 *                         description: Mã sản phẩm của dòng lỗi
 *                         example: PRD-003
 *                       errors:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Danh sách lỗi của dòng đó
 *                         example: ["Đơn vị \"Hộp\" không tồn tại trong hệ thống"]
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /product/export:
 *   get:
 *     summary: Xuất danh sách sản phẩm ra file Excel
 *     description: |
 *       Tải xuống file Excel chứa toàn bộ (hoặc lọc theo điều kiện) danh sách sản phẩm.
 *       File có định dạng `.xlsx` với sheet **Sản phẩm** gồm các cột:
 *       Mã SP | Tên SP | Đơn vị | Tồn tối thiểu | Quy cách
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Lọc theo mã sản phẩm (chính xác)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Lọc theo tên sản phẩm (chính xác)
 *     responses:
 *       "200":
 *         description: File Excel tải về thành công
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: 'attachment; filename="products_1710689651000.xlsx"'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Tạo sản phẩm
 *     description: |
 *       Tạo mới sản phẩm. Gửi `multipart/form-data` nếu cần upload ảnh (field `image`).
 *       Nếu không kèm ảnh, có thể tiếp tục gửi JSON thuần như trước.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - unit
 *               - minStock
 *             properties:
 *               code:
 *                 type: string
 *                 description: Mã sản phẩm (duy nhất)
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               minStock:
 *                 type: number
 *               package:
 *                 type: string
 *                 description: Quy cách đóng gói
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện (JPG, PNG, WEBP · tối đa 2MB)
 *           example:
 *             code: PRD-001
 *             name: Nồi cơm điện
 *             unit: cái
 *             minStock: 10
 *             package: Hộp
 *     responses:
 *       "201":
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Product'
 *       "400":
 *         $ref: '#/components/schemas/Error'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     description: Hỗ trợ lọc và phân trang.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Mã sản phẩm
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tên sản phẩm
 *       - in: query
 *         name: unit
 *         schema:
 *           type: string
 *         description: Đơn vị tính
 *       - in: query
 *         name: minStock
 *         schema:
 *           type: number
 *         description: Tồn tối thiểu
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
 * /product/{productId}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     description: Theo ID sản phẩm
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
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
 *   put:
 *     summary: Cập nhật sản phẩm
 *     description: |
 *       Cập nhật thông tin sản phẩm theo ID. Gửi `multipart/form-data` nếu muốn thay ảnh (`image`).
 *       Có thể gửi `removeImage=true` (checkbox) để xoá ảnh hiện tại.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               minStock:
 *                 type: number
 *               package:
 *                 type: string
 *               removeImage:
 *                 type: boolean
 *                 description: true để xoá ảnh hiện tại (bỏ qua nếu upload ảnh mới)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện mới (JPG, PNG, WEBP · tối đa 2MB)
 *           example:
 *             name: Nồi cơm điện (bản mới)
 *             minStock: 15
 *             removeImage: false
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Product'
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
 *     summary: Xóa sản phẩm
 *     description: Xóa theo ID sản phẩm.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm
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
