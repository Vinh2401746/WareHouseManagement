const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');
const uploadProductImage = require('../../middlewares/uploadImage');
const normalizeProductPayload = require('../../middlewares/normalizeProductPayload');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');
const productInventoryController = require('../../controllers/productInventory.controller');

const router = express.Router();

// ─── Excel Import / Export (phải đặt TRƯỚC /:productId) ──────────────────────

router.get('/import-template', auth('getProducts'), productController.getImportTemplate);

router.post('/import', auth('manageProducts'), upload.single('file'), productController.importProducts);

router.get('/export', auth('getProducts'), validate(productValidation.exportProducts), productController.exportProducts);

// ─── Inventory overview APIs ────────────────────────────────────────────────

router.get(
  '/inventory-overview',
  auth('getProductInventory'),
  validate(productValidation.getInventoryOverview),
  productInventoryController.getInventoryOverview
);

router.get(
  '/:productId/inventory-detail',
  auth('getProductInventory'),
  validate(productValidation.getInventoryDetail),
  productInventoryController.getInventoryDetail
);

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
 * /product/inventory-overview:
 *   get:
 *     summary: Tổng quan tồn kho sản phẩm
 *     description: |
 *       Trả về bảng tổng hợp tồn kho, doanh số và cảnh báo cho từng sản phẩm.
 *       Nếu không truyền khoảng thời gian, hệ thống tự động lấy 30 ngày gần nhất.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Tìm theo mã hoặc tên sản phẩm (không phân biệt hoa thường)
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Lọc theo 1 sản phẩm (ObjectId)
 *       - in: query
 *         name: productIds
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Lọc theo nhiều sản phẩm (mảng ObjectId hoặc truyền nhiều lần)
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Giới hạn dữ liệu theo kho (có thể truyền 1 hoặc nhiều giá trị)
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *         description: Tương tự `warehouse`, dạng đơn lẻ cho kho chính
 *       - in: query
 *         name: warehouseIds
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Alias của `warehouse` khi gọi từ UI cũ
 *       - in: query
 *         name: alertOnly
 *         schema:
 *           type: boolean
 *         description: true để chỉ trả về sản phẩm đang thấp hơn tồn tối thiểu
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Ngày bắt đầu tính doanh số (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Ngày kết thúc tính doanh số (ISO 8601)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Alias của `startDate`
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Alias của `endDate`
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: field:asc|desc (mặc định theo tên tăng dần)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Số bản ghi mỗi trang (tối đa 100)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại
 *     responses:
 *       "200":
 *         description: Bảng tổng quan tồn kho
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   description: Danh sách sản phẩm sau khi áp dụng bộ lọc
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *                       stockByWarehouse:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             warehouse:
 *                               type: string
 *                               description: ID kho
 *                             quantity:
 *                               type: number
 *                             value:
 *                               type: number
 *                       totalStock:
 *                         type: number
 *                       totalStockValue:
 *                         type: number
 *                         description: Giá trị vốn hiện tại (làm tròn)
 *                       revenue:
 *                         type: number
 *                       costOfGoods:
 *                         type: number
 *                       manualAdjustmentsCost:
 *                         type: number
 *                       profit:
 *                         type: number
 *                         description: Doanh thu - giá vốn - chi phí xuất thủ công
 *                       soldQuantity:
 *                         type: number
 *                       manualExportQuantity:
 *                         type: number
 *                       lastImportAt:
 *                         type: string
 *                         format: date-time
 *                       lastExportAt:
 *                         type: string
 *                         format: date-time
 *                       isBelowMin:
 *                         type: boolean
 *                       alerts:
 *                         type: array
 *                         items:
 *                           type: string
 *                       missingCostLines:
 *                         type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *                 summary:
 *                   type: object
 *                   description: Tổng hợp nhanh sau khi lọc
 *                   properties:
 *                     totalStock:
 *                       type: number
 *                     totalStockValue:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     totalCost:
 *                       type: number
 *                     totalProfit:
 *                       type: number
 *                     lowStockCount:
 *                       type: number
 *                       description: Số sản phẩm dưới tồn tối thiểu
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: string
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /product/{productId}/inventory-detail:
 *   get:
 *     summary: Chi tiết tồn kho cho 1 sản phẩm
 *     description: |
 *       Trả về snapshot tồn kho, lợi nhuận và lịch sử nhập/xuất gần nhất của sản phẩm.
 *       Khoảng thời gian mặc định là 30 ngày cuối cùng nếu không truyền tham số ngày.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID sản phẩm cần tra cứu
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Lọc lịch sử theo kho (truyền 1 hoặc nhiều ID)
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *         description: Kho đơn lẻ (alias của `warehouse`)
 *       - in: query
 *         name: warehouseIds
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Alias khác phục vụ UI cũ
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Tính lịch sử từ ngày này (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Alias của `startDate`
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Alias của `endDate`
 *     responses:
 *       "200":
 *         description: Chi tiết tồn kho và lịch sử giao dịch gần nhất
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 stockSnapshot:
 *                   type: object
 *                   properties:
 *                     totalStock:
 *                       type: number
 *                     totalStockValue:
 *                       type: number
 *                     lastImportAt:
 *                       type: string
 *                       format: date-time
 *                     stockByWarehouse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           warehouse:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           value:
 *                             type: number
 *                 profitSummary:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                     costOfGoods:
 *                       type: number
 *                     manualAdjustmentsCost:
 *                       type: number
 *                     profit:
 *                       type: number
 *                 sales:
 *                   type: object
 *                   properties:
 *                     soldQuantity:
 *                       type: number
 *                     manualExportQuantity:
 *                       type: number
 *                     lastExportAt:
 *                       type: string
 *                       format: date-time
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: string
 *                 histories:
 *                   type: object
 *                   properties:
 *                     imports:
 *                       type: array
 *                       description: Tối đa 10 phiếu nhập gần nhất
 *                       items:
 *                         type: object
 *                         properties:
 *                           transactionId:
 *                             type: string
 *                           transactionDate:
 *                             type: string
 *                             format: date-time
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                           totalAmount:
 *                             type: number
 *                           supplier:
 *                             type: string
 *                             description: ID nhà cung cấp (nếu có)
 *                           warehouse:
 *                             type: string
 *                           batch:
 *                             type: string
 *                     manualExports:
 *                       type: array
 *                       description: Tối đa 10 phiếu xuất thủ công gần nhất
 *                       items:
 *                         type: object
 *                         properties:
 *                           transactionId:
 *                             type: string
 *                           transactionDate:
 *                             type: string
 *                             format: date-time
 *                           quantity:
 *                             type: number
 *                           costPrice:
 *                             type: number
 *                           costTotal:
 *                             type: number
 *                           warehouse:
 *                             type: string
 *                           reason:
 *                             type: string
 *                     sales:
 *                       type: array
 *                       description: Tối đa 10 đơn bán gần nhất
 *                       items:
 *                         type: object
 *                         properties:
 *                           saleId:
 *                             type: string
 *                           code:
 *                             type: string
 *                           saleDate:
 *                             type: string
 *                             format: date-time
 *                           customerName:
 *                             type: string
 *                           warehouse:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                           lineTotal:
 *                             type: number
 *                           costPrice:
 *                             type: number
 *                           costTotal:
 *                             type: number
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
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
