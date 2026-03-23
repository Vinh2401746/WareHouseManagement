# PLAN: PRODUCT_INVENTORY_SCREEN

## Mục tiêu

- Xây dựng màn hình tra cứu danh sách sản phẩm trong kho với đầy đủ thông tin cơ bản, tổng tồn, giá trị tồn, tồn tối thiểu.
- Hiển thị lịch sử nhập/xuất, giá nhập – giá bán theo từng đợt để người dùng theo dõi biến động và xác định doanh thu/lợi nhuận.
- Cung cấp API/logic để tính toán doanh thu, giá vốn và lợi nhuận dựa trên dữ liệu `InventoryTransaction`, `ProductBatch`, `Sale` hiện có.
- Đưa ra gợi ý triển khai dựa trên benchmark các phần mềm quản lý kho phổ biến (ví dụ KiotViet, Sapo, Zoho Inventory).

## Non-goals (chưa làm ở phase này)

- Không chỉnh sửa quy trình tạo phiếu nhập/xuất hoặc đơn bán hàng.
- Không thực hiện chức năng chỉnh sửa dữ liệu lịch sử từ màn hình này (read-only).
- Không triển khai biểu đồ nâng cao hoặc dashboard đa chiều (giữ mức bảng + thống kê cơ bản).
- Không xử lý nghiệp vụ định giá nâng cao (FIFO/LIFO) ngoài việc dùng giá vốn theo batch đã lưu.
- Không triển khai hoặc mô tả chi tiết phần Frontend (scope plan này chỉ tập trung Backend).

## Phân chia phase triển khai

- **Phase 1 – Nền tảng dữ liệu & schema**
  - Bổ sung các field snapshot (`costPrice`, `costTotal`) cho `Sale.items` và `InventoryTransaction.items` (EXPORT thủ công) + cập nhật service tạo dữ liệu tương ứng.
  - Chuẩn hóa helper xử lý image/path và các model liên quan (nếu cần) để đảm bảo dữ liệu sẵn sàng cho aggregation.
  - Viết unit test đảm bảo sale/export mới tạo sẽ lưu snapshot đúng, không ảnh hưởng flow cũ.

- **Phase 2 – Service tính toán & helper**
  - Tạo `productInventory.service.js` với các hàm `getInventoryOverview`, `getInventoryDetail`, helper aggregate stock/transactions/profit.
  - Thêm logic chuẩn hóa double-count (separate Sale vs EXPORT thủ công), fallback cost cho batch thiếu.
  - Viết unit test cấp service (mock models) để verify aggregation và edge cases chính (date range, thiếu batch, cảnh báo).

- **Phase 3 – Routes, controller, validation & integration tests**
  - Thêm route/controller mới (hoặc mở rộng product route) + Joi validation, permission wiring.
  - Viết integration test (hoặc e2e mỏng) để đảm bảo endpoint trả đúng dữ liệu & error.
  - Bổ sung logging/perf guard + hướng dẫn manual test.

## Bối cảnh hiện trạng

- Backend Express + MongoDB, kiến trúc 3 lớp. Product metadata ở [BE/src/models/product.model.js](../BE/src/models/product.model.js) chỉ chứa `code`, `name`, `unit`, `minStock`, `imagePath`. Không có trường tồn.
- Giá vốn/tồn thực tế nằm ở [BE/src/models/productBatch.model.js](../BE/src/models/productBatch.model.js) (`warehouse`, `quantity`, `importPrice`). Giao dịch nhập/xuất trong [BE/src/models/inventoryTransaction.model.js](../BE/src/models/inventoryTransaction.model.js) và [BE/src/services/inventoryTransaction.service.js](../BE/src/services/inventoryTransaction.service.js). Đơn bán hàng lưu giá bán tại [BE/src/models/sale.model.js](../BE/src/models/sale.model.js) và sinh `InventoryTransaction` EXPORT qua [BE/src/services/sale.service.js](../BE/src/services/sale.service.js).
- FE React 19 + Ant Design. Danh sách sản phẩm cơ bản ở [ware-house-fe/src/pages/app/products/index.tsx](../ware-house-fe/src/pages/app/products/index.tsx). Không có trang nào hiển thị tồn theo sản phẩm.
- Không tồn tại API tổng hợp (report) để FE gọi một lần lấy stock/history.

## Yêu cầu nghiệp vụ (đã chốt)

- **Danh sách sản phẩm trong kho**: lọc theo kho cụ thể và/hoặc từ khóa tên, mã; mỗi dòng cần thông tin sản phẩm + tổng tồn hiện tại, tồn tối thiểu, giá trị tồn (số lượng × giá vốn trung bình hoặc gần nhất).
- **Lịch sử nhập kho**: cho mỗi sản phẩm, hiển thị các đợt nhập (phiếu nhập hoặc batch) kèm ngày, nhà cung cấp, số lượng, giá nhập đơn vị, tổng tiền.
- **Lịch sử xuất kho/bán hàng**: tương tự, lấy dữ liệu từ đơn bán hàng hoặc phiếu xuất (EXPORT) với khách hàng, số lượng, giá bán, tổng tiền.
- **Giá nhập – giá bán từng đợt**: cần thể hiện cặp giá vốn/giá bán, qua đó thấy chênh lệch.
- **Doanh thu & lợi nhuận**: tính dựa trên tổng giá bán (doanh thu) và tổng giá vốn (sử dụng `ProductBatch.importPrice` ứng với từng batch đã bán) trong khoảng thời gian chọn.
- **Benchmark yêu cầu**: cung cấp gợi ý về cách phần mềm khác tách bạch giá nhập/giá bán để tính lợi nhuận.

## Các điểm đã confirm

1. **Phạm vi kho**: mặc định hiển thị tất cả kho của cửa hàng; người dùng có thể lọc lại theo từng kho khi cần.
2. **Khoảng thời gian lịch sử**: mặc định 30 ngày, nhưng vẫn cho phép chọn bất kỳ khoảng thời gian nào (không giới hạn cứng).
3. **Định nghĩa lợi nhuận**: tính dựa trên giá nhập thực tế của từng lô (cost theo batch).
4. **UI triển khai**: trang độc lập trong menu (không phải modal/drawer từ trang sản phẩm hiện tại).

## Thiết kế UX / Flow

### 1. Trang tổng quan sản phẩm trong kho

- Bộ lọc trên cùng: kho (mặc định "Tất cả kho", cho phép chọn 1 kho cụ thể), khoảng thời gian (date range, default 30 ngày, không giới hạn tối đa), từ khóa (code/name), trạng thái cảnh báo tồn (tất cả/< tồn tối thiểu >).
- Bảng chính (TableCommon) hiển thị mỗi sản phẩm với các cột: ảnh + mã + tên, đơn vị, tồn tối thiểu, tồn hiện tại (tổng theo kho filter), giá trị tồn, doanh thu (trong range), lợi nhuận, lần nhập cuối, lần xuất cuối.
- Thanh hiển thị tổng quan (cards) phía trên: tổng số sản phẩm, tổng tồn kho, tổng giá trị tồn, tổng lợi nhuận trong range.
- Tương tác: click vào hàng mở Drawer chi tiết.

### 2. Drawer chi tiết sản phẩm

- Tab **Tổng quan**: thông tin sản phẩm, ảnh, tồn theo từng kho (bảng), biểu đồ nhỏ thể hiện biến động tồn trong range.
- Tab **Nhập kho**: bảng các phiếu nhập/batch (ngày, mã phiếu, nhà cung cấp, số lượng, giá nhập, tổng tiền, người tạo).
- Tab **Xuất kho / Bán hàng**: bảng đơn bán/phiếu xuất (ngày, khách hàng, số lượng, giá bán, tổng tiền, người bán).
- Tab **Giá & lợi nhuận**: bảng so sánh từng đợt (kéo từ import/export matching theo batch) + thống kê: doanh thu, giá vốn, lợi nhuận, biên lợi nhuận.
- Nút Export CSV/PDF (phase sau) → non-goal hiện tại.

### 3. Tích hợp navigation

- Thêm mục mới trong menu (ví dụ: "Tồn kho theo sản phẩm").
- Từ trang sản phẩm hiện tại cho phép bấm "Xem tồn kho" để deep-link tới trang mới với sẵn bộ lọc.

## Benchmark & Gợi ý

- **KiotViet**/Sapo: hiển thị "Giá vốn" (từ phiếu nhập) và "Giá bán" (từ hóa đơn). Lợi nhuận = doanh thu - giá vốn, được trình bày trong báo cáo sản phẩm. Họ lưu giá vốn tại thời điểm bán để tránh thay đổi về sau.
- **Zoho Inventory / Odoo**: tách Goods Receipt (giá nhập) và Sales Order (giá bán); khi bán, hệ thống ghi nhận cost theo FIFO và lưu cost snapshot trong `stock.move`. ⇒ Đề xuất hệ thống hiện tại cũng nên lưu `costPrice` snapshot trong `Sale.items` khi tạo sale để đảm bảo dữ liệu lịch sử không bị ảnh hưởng nếu import price bị chỉnh sửa.
- **Đề xuất**: Hiện tại `Sale.items` chưa có `costPrice`. Ta nên:
  - Bổ sung trường `costPrice` (hoặc `costAmount`) khi tạo sale (lấy từ `ProductBatch.importPrice`).
  - Với dữ liệu cũ, tạm tính bằng cách join batch mỗi lần truy vấn.

## Thiết kế Data Model

### Mục tiêu

- Cho phép truy vấn nhanh tổng tồn theo kho, lịch sử nhập/xuất, giá vốn và giá bán theo thời gian.
- Giảm phụ thuộc vào phép tính động quá nặng.

### Đề xuất schema / thay đổi

1. **Sale item snapshot** (khuyến khích): thêm trường `costPrice` và `costTotal` vào `Sale.items` để lưu giá vốn tại thời điểm bán. Cần cập nhật [BE/src/services/sale.service.js](../BE/src/services/sale.service.js) khi tạo `saleItems.push`.
2. **EXPORT thủ công**: thêm optional `costPrice`/`costTotal` trong `InventoryTransaction.items` (khi `type === 'EXPORT'` và không gắn sale) để backend biết giá vốn ngay tại thời điểm xuất; nếu thiếu snapshot thì bắt buộc gắn `batch` để truy ra `ProductBatch.importPrice` làm fallback.
3. **Chỉ số phụ trợ**: nếu chưa có, thêm index trên `ProductBatch(product, warehouse)`, `Sale.items.product`, `Sale.items.batch`, `InventoryTransaction.items.product` để tăng tốc aggregation.
4. **Không tạo collection mới** ở phase này; sử dụng aggregation pipelines + caching nhẹ.

### Tương thích & Migration

- Thêm trường `costPrice` là optional → không phá vỡ dữ liệu cũ. Khi đọc dữ liệu cũ (thiếu snapshot) fallback sang `ProductBatch.importPrice`.
- Nếu bổ sung index → chỉ là background build, không ảnh hưởng logic.

## Thiết kế kỹ thuật / Kiến trúc

### Backend (Express API)

1. **Route layer**: tạo mới `productInventory.route.js` hoặc mở rộng `product.route.js` với namespace `/product/inventory`:
   - `GET /v1/product/inventory-overview`: query list, auth `getProducts`.
   - `GET /v1/product/:productId/inventory-overview`: chi tiết, auth `getProducts`.
2. **Controller** (`productInventory.controller.js`): dùng `catchAsync`, `pick`, convert query params (warehouseId, date range, pagination, sort, alert flags).
3. **Service** (`productInventory.service.js`):
   - `getInventoryOverview(filter, options)`:
     - B1: từ filter keyword → query `Product` (paginate) để có list id.
     - B2: dùng aggregation `ProductBatch` để tính:
       - `stockByWarehouse`: sum quantity, sum value (`quantity * importPrice`).
       - `totalStock`, `totalStockValue`, `avgCost`.
    - B3: trong khoảng thời gian, tổng hợp `InventoryTransaction` type IMPORT và phân tách nguồn EXPORT để tránh double-count:
      - `Sale` (hoặc `InventoryTransaction` gắn `sale`/`reason === 'SALE'`) dùng làm nguồn doanh thu chuẩn vì đã có giá bán.
      - Các `InventoryTransaction` EXPORT thủ công (`reason !== 'SALE'`) chỉ cộng thêm khi không trùng với sale, đồng thời cần gắn batch để suy ra cost.
      - Sau khi chuẩn hoá hai nguồn trên, compute `lastImport`, `lastExport`, `revenue`, `profit`.
   - `getInventoryDetail(productId, filters)`:
     - Query product + stock detail (group by warehouse) + soon-to-expire batches.
     - Fetch import/export transactions (with pagination limit, default 20) joined with supplier/customer info.
     - Build price history arrays (sorted by date) for chart/table.
     - Compute `profitSummary` (revenue, cost, profit, margin) in date range.
4. **Helper**: extractor to map sale line -> cost: prefer `costPrice` snapshot; fallback join `ProductBatch`. Với `InventoryTransaction` EXPORT thủ công, ưu tiên dùng `item.costPrice`; nếu không có thì bắt buộc tra cứu batch để lấy `importPrice`, trường hợp thiếu batch phải trả về cost = 0 kèm cảnh báo trong response.
5. **Validation**: add Joi schemas in `BE/src/validations/product.validation.js` (hoặc file mới) cho query params (dates, pagination, enums).
6. **Permissions**: update [BE/src/config/roles.js](../BE/src/config/roles.js) nếu cần role mới (`getProductInventory`).
7. **Performance**: apply projection to limit fields, add caching header (short). Consider using `lean()` for aggregator.

### Reporting revenue & profit

- Dùng date range filter (default 30 ngày, không giới hạn tối đa). Toàn bộ tính toán diễn ra ở backend để tránh tải nặng lên client.
- Provide aggregated fields: `totalRevenue`, `totalCost`, `totalProfit`, `profitMargin` per product and overall summary.

## Các thay đổi dự kiến trong code

- `BE/src/routes/v1/product.route.js` (hoặc route mới): thêm endpoints inventory overview/detail.
- `BE/src/controllers/product.controller.js` (hoặc file mới) để xử lý request mới.
- `BE/src/services/product.service.js` (hoặc service mới `productInventory.service.js`) chứa aggregation logic.
- `BE/src/validations/product.validation.js`: schema cho query params.
- `BE/src/services/sale.service.js`: thêm `costPrice` snapshot cho sale items (nếu áp dụng).
- `BE/src/models/inventoryTransaction.model.js` & `BE/src/services/inventoryTransaction.service.js`: bổ sung trường `costPrice`/`costTotal` cho EXPORT thủ công và ensure khi tạo/cập nhật phiếu xuất thủ công phải ghi nhận cost hoặc ép chọn batch để suy ra cost.
- `BE/src/models/sale.model.js`: bổ sung field optional `costPrice`, `costTotal`.
- `BE/src/config/roles.js`: đảm bảo role có quyền truy cập endpoint mới.

## Logging & Bảo mật

- Log thời gian thực thi aggregation > threshold (ví dụ 500ms) để theo dõi hiệu năng.
- Ghi log truy cập chi tiết (user id, product id) để audit khi xem báo cáo nhạy cảm.
- Mọi endpoint mới phải qua `auth()` + permission `getProducts` (hoặc quyền riêng). Không expose dữ liệu giá cho user thường.
- Sanitize/làm sạch input (date range, search) qua Joi.

## Rủi ro / Edge cases

- **Truy vấn nặng**: Aggregation trên nhiều collection có thể chậm nếu không index → cần giới hạn date range mặc định + paginate + index.
- **Dữ liệu lịch sử thiếu batch**: sale cũ có thể thiếu `batch` (nếu import tay) → cần fallback (ví dụ: cost = 0 hoặc avg). Ghi rõ trong response.
- **Chi phí lưu trữ**: nếu thêm `costPrice` snapshot, kích thước sale document tăng nhưng chấp nhận được.
- **Sai lệch dữ liệu**: thay đổi `ProductBatch.importPrice` thủ công sau này sẽ làm lệch lịch sử nếu không snapshot → nêu rõ trong docs.
- **Quyền hạn**: cần đảm bảo chỉ user quản lý mới xem được giá vốn/lợi nhuận.
- **Double-count doanh thu**: nếu vừa đọc `Sale` vừa đọc `InventoryTransaction` EXPORT mà không filter lý do → doanh thu/lợi nhuận bị nhân đôi; cần test và log filter rõ ràng.
- **EXPORT thủ công thiếu cost**: phiếu xuất không có `costPrice` hoặc `batch` khiến lợi nhuận sai; cần bắt buộc snapshot hoặc cảnh báo chi tiết.

## Test plan

### Happy paths

1. **GET /v1/product/inventory-overview** với filter kho + keyword → trả danh sách có trường `totalStock`, `totalRevenue`, `totalProfit` chính xác.
2. **GET /v1/product/:id/inventory-overview** → trả stock by warehouse, lịch sử nhập/xuất, price history.
3. **Profit calc**: tạo dữ liệu mẫu (1 phiếu nhập, 1 sale) → profit = revenue - cost.

### Edge cases

- Không có giao dịch trong range → response `history` rỗng nhưng stock summary vẫn có.
- Sản phẩm không còn batch nào → tồn = 0, highlight warning (< minStock).
- Lọc theo kho mà sản phẩm chưa từng nhập → ẩn/hiện tuỳ `showZeroStock` flag.
- Date range quá lớn → service trả 400 với message hướng dẫn.
- Có cả sale và phiếu EXPORT thủ công trong cùng range → đảm bảo aggregation không double-count doanh thu/lợi nhuận (kiểm tra filter reason/status).
- Phiếu EXPORT thủ công thiếu batch hoặc thiếu snapshot cost → service phải trả cảnh báo kèm cost = 0 hoặc reject request theo rule đã chọn.

### Regression

- Đảm bảo các API cũ (`/product`, `/inventory`, `/sale`) không bị ảnh hưởng.
- Nếu thêm field mới vào `Sale.items`, cập nhật unit tests liên quan.

## Những điểm dễ thay đổi trong tương lai

- **API biểu đồ**: có thể bổ sung endpoint trả dữ liệu time-series để FE dựng chart nâng cao.
- **Export báo cáo**: xây endpoint xuất CSV/PDF cho danh sách/chi tiết.
- **Tối ưu hiệu năng**: cache kết quả aggregated theo kho/date range (Redis) hoặc tạo nightly snapshot.
- **Đa kho**: mở rộng logic aggregator để so sánh nhiều kho song song.

## Nơi nên tách module/hàm

- `productInventory.service.js`: tách các helper `aggregateStock()`, `aggregateTransactions()`, `calculateProfit()` để dễ unit test.

---

Plan này dựa trên research trong [product_inventory_screen_research](product_inventory_screen_research/codebase-analysis.md). Vui lòng review và confirm các điểm đang chờ ở phần "Các điểm cần confirm" trước khi chuyển sang /implement_plan.
