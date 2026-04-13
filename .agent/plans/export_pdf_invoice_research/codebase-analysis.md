# Codebase Analysis — Export PDF Invoice (A4)

## Frontend (ware-house-fe)

### Hiện trạng liên quan
- API module sales: `ware-house-fe/src/api/sales/index.ts`
  - `getInvoicesApi` → `GET /v1/sale?limit=&page=&customer=`
  - `getInvoiceByIdApi` → `GET /v1/sale/:id`
- Trang danh sách hóa đơn bán hàng: `ware-house-fe/src/pages/app/sales/index.tsx`
  - Hiện có actions: “Chi Tiết Đơn”, duyệt/huỷ/xoá (đang có dấu hiệu copy/paste từ nghiệp vụ nhập kho)
  - Chưa có nút 🔍 preview A4 và 📥 download PDF
  - Permission hiện đang dùng: `usePermission("inventoryTransactions")` (không khớp với backend permission group `sales`)
- Menu permission map: `ware-house-fe/src/layouts/menus/menu.tsx` đang map `AppRoutes.sales_invoice` → `inventoryTransactions` (cần đổi sang `sales` để match `getSales/manageSales`).

### Dependencies
- FE chưa có thư viện tạo PDF/QR.
- Cần thêm: `html2pdf.js` (hoặc `html2canvas` + `jspdf`) và `qrcode.react`.

### Download pattern có sẵn
- `ware-house-fe/src/pages/app/products/index.tsx` đang download blob qua `URL.createObjectURL` + `<a download>`.

## Backend (BE)

### Endpoints
- Route: `BE/src/routes/v1/sale.route.js`
  - `GET /v1/sale` requires `auth('getSales')`
  - `GET /v1/sale/:saleId` requires `auth('getSales')`

### Service hiện trạng
- `BE/src/services/sale.service.js`:
  - `getSaleById` hiện chỉ `return Sale.findById(id);` (KHÔNG populate).
  - `querySales` dùng `Sale.paginate(filter, options)`; plugin paginate có hỗ trợ `options.populate` nhưng controller không truyền populate.

### Data model
- `BE/src/models/sale.model.js` tham chiếu:
  - `branch` → Branch
  - `warehouse` → Warehouse
  - `soldBy` → User
  - `customer` → Customer
  - `items[].product` → Product
  - `items[].batch` → ProductBatch
- `BE/src/models/branch.model.js` hiện chưa có field logo.

### Permissions
- `BE/src/constants/permission.constant.js` có `getSales/manageSales` group `sales`.

## Test situation (BE)
- Có tests sale ở `BE/tests/integration/sale.test.js` và fixtures `BE/tests/fixtures/sale.fixture.js`.
- Fixtures hiện đang dùng `faker.random.word()` cho các field cần ObjectId (branch/warehouse/soldBy/items...), khả năng không hợp lệ so với validation hiện tại.
- Khi implement populate/field trả về chi tiết, tests cần được cập nhật hoặc tối thiểu điều chỉnh assertions để phù hợp.
