# PLAN: Data Branch Scoping

## Mục tiêu

- Gắn thuộc tính `branch` (chi nhánh) vào tất cả các thực thể nghiệp vụ cốt lõi để giới hạn phạm vi truy cập dữ liệu.
- Đảm bảo danh mục cơ bản như **Sản phẩm (Product), Nhà cung cấp (Supplier), Đơn vị (Unit)** hoạt động theo mô hình *Cửa hàng độc lập* (Cửa hàng nào chỉ thấy đồ của cửa hàng đó).
- Tối ưu hiệu suất bằng cách thêm dư thừa (denormalize) trường `branch` vào **Lô hàng (ProductBatch) và Cập nhật kho (InventoryTransaction)**.
- Tự động gán ranh giới chi nhánh cho các Create API dựa trên thông tin người dùng đang thao tác.

## Non-goals (chưa làm ở phase này)

- KHÔNG thay đổi User Interface (FE).
- KHÔNG tạo thêm tính năng share sản phẩm liên chi nhánh.
- KHÔNG thay đổi các logic permission RBAC đã hoàn thành.

## Bối cảnh hiện trạng

- `Product`, `Supplier`, `Unit` đang dùng chung toàn hệ thống (không có trường `branch`).
- `ProductBatch`, `InventoryTransaction` có liên kết `warehouse` (ăn ngầm theo chi nhánh của kho) nhưng chứa cấu trúc truy vấn chậm.
- Các module đã tích hợp sẵn utils `branchScope.js` (`applyBranchScope` và `applyWarehouseScope`) tại tầng Services.

## Yêu cầu nghiệp vụ (đã chốt)

- **Yêu cầu 1 (Option B - Split Catalogs):** Cập nhật Schema cho `Product`, `Supplier`, `Unit` để có trường `branch` kiểu `ObjectId` bắt buộc (required: true).
- **Yêu cầu 2 (Option B - Denormalize Transactions):** Cập nhật Schema cho `ProductBatch` và `InventoryTransaction` thêm trường `branch` bắt buộc (required: true). 
- **Yêu cầu 3 (Auto-bind Branch at Create):** Thay đổi logic API Create. Nếu User không phải là nhóm có quyền `global` (Superadmin), hệ thống tự động chèn/ghi đè `body.branch = req.user.branch`. Superadmin được cấp quyền truyền lên UUID của bất cứ Branch nào để tạo giùm.

## Thiết kế Kỹ thuật / Flow

### Flow 1: Tạo mới bản ghi (Product, Supplier, Unit, Batch, Transaction)

- **Step 1:** Request bay vào Controller. Controller lấy `req.body`.
- **Step 2:** Kiểm tra `context` của user thông qua scope context.
- **Step 3:** Nếu `!isGlobalScope`, bắt buộc gán `req.body.branch = req.user.branch`. Bỏ qua bất kì ID nào user truyền lên cố ý giả định.
- **Step 4:** Nếu là `isGlobalScope`, lấy `req.body.branch` do Frontend truyền (nếu không có thì báo lỗi "Vui lòng chọn chi nhánh").
- **Step 5:** Khi tạo `ProductBatch` hoặc `Transaction`, validate xem `req.body.warehouse` được cấp phát có thuộc vào `branch` đích đó không. Mới cho phép Save.

### Flow 2: Truy vấn danh sách (Read / Query)

- **Step 1:** Request bay vào Controller (GET list).
- **Step 2:** Controller gọi `buildScopeContext(req)` để nhồi `context` xuống Service.
- **Step 3:** Service sử dụng `applyBranchScope(filter, context)` vào Mongoose Query để Mặc định gắn `{ branch: user.branch }` lọc dữ liệu ở DB level trước khi tính toán paginate.

## Thiết kế Data Model

### Thay đổi Schema

- Cần Update 5 Models (`src/models/*`):
  1. `product.model.js` - Thêm `branch: { type: mongoose.SchemaTypes.ObjectId, ref: 'Branch', required: true }`
  2. `supplier.model.js` - Thêm `branch`
  3. `unit.model.js` - Thêm `branch`
  4. `productBatch.model.js` - Thêm `branch`
  5. `inventoryTransaction.model.js` - Thêm `branch`

### Tương thích & Migration

- Các bản ghi CŨ trong database đang không có trường `branch`.
- **Migration Script:** Cần làm 1 file script `scripts/migrations/migrateDataBranchScope.js`:
  - Tính toán `ProductBatch` & `InventoryTransaction`: Lookup ID của `warehouse` sang model Warehouse để móc `branch` và Update lại.
  - Tính toán `Product`, `Supplier`, `Unit`: Phân bổ vào 1 Branch mặc định (VD: Lấy branch đầu tiên tìm thấy của hệ thống hoặc Admin chỉ định qua env variable `DEFAULT_MIGRATION_BRANCH`).

## Các thay đổi dự kiến trong code

### Phase 1: Data Model & Seed Migration
- `{BE/src/models/product.model.js}`: Bổ sung schema `branch`.
- `{BE/src/models/supplier.model.js}`: Bổ sung schema `branch`.
- `{BE/src/models/unit.model.js}`: Bổ sung schema `branch`.
- `{BE/src/models/productBatch.model.js}`: Bổ sung schema `branch`.
- `{BE/src/models/inventoryTransaction.model.js}`: Bổ sung schema `branch`.
- `{BE/scripts/migrations/migrateDataBranchScope.js}` (mới): Mã script seed nâng cấp schema DB từ null lên có id.
- `{BE/package.json}`: Thêm scripts chạy migrate data.

### Phase 2: Validations & Controllers
- `{BE/src/validations/*.js}`: Cho 5 entity, update schema tạo mới có hỗ trợ param `branch` tuỳ chọn (cho phép Superadmin).
- `{BE/src/controllers/*.controller.js}`: Tại hàm `createX`, chèn thêm logic tự động gán `req.body.branch = req.user.branch`.
- Đảm bảo các hàm query có đủ `buildScopeContext`.

### Phase 3: Services & Query Scopes
- `{BE/src/services/*.service.js}`:
  - Cập nhật hàm `queryX` để áp dụng `applyBranchScope(filter, context)`.
  - Hàm `getById` hoặc update/delete cần bổ sung check quyền sở hữu branch (Tránh user lấy ID của cửa hàng khác update/delete bằng cách gọi trực tiếp Endpoint).

## Mốc triển khai (Implementation Phases)
1. **Phase 1: Database Migration & Schema Update**. Tiến hành cập nhật Models và chạy script gán branch cho data hiện trạng.
2. **Phase 2: Controller & Service Enforcements**. Wrap `applyBranchScope` cho mọi truy vấn Read, và override logic gán branch cho Create/Update.
3. **Phase 3: Security & Validations check**. Thiết lập Rule kiểm tra quan hệ chéo (e.g. Mua hàng vào Kho A thì SP và Supplier phải thuộc Branch chứa Kho A đó).

## Rủi ro / Edge cases

- **Rủi ro 1 (Cross-branch Injection)**: User tạo `InventoryTransaction` ở branch A nhưng truyền `warehouseId` của branch B.
  - → **Cách xử lý**: Tại `inventoryTransaction.service.js`, lúc create phải fetch Warehouse check `warehouse.branch.toString() === transaction.branch.toString()`.
- **Rủi ro 2 (Migration Data mồ côi)**: Có 1 Product nhưng không do ai tạo, ko biết thuộc branch nào.
  - → **Cách xử lý**: Trong file Migrate sẽ tạo 1 biến cờ `fallbackBranch` trỏ vào Kho/Hệ thống mặc định đầu tiên của User admin hoặc Cửa hàng đầu tiên của CSDL để tránh dính field required null.

## Test plan

### Happy paths
- **Chỉ hiển thị Product hợp lệ**: Login Nhân viên Branch A -> call `GET /v1/products` -> Chỉ trả ra Product thuộc Branch A.
- **Tự động gán Branch khi tạo Item**: Login Staff Branch A -> call `POST /v1/suppliers` với body rỗng `branch` -> Database sinh Supplier có `branch = Branch A`.

### Edge cases
- Nhân viên dỏm lấy token Branch A, cố tình POST Body `{ "branch": "branch_B_id" }` → Payload bị chèn đè lại thành Branch A. Chống Hacker cross-org.
- Phân tách kho: Nhân sự Branch A tạo InventoryTransaction tới Warehouse của Branch B → API quăng lỗi `403/400 Warehouse Invalid`.

### Regression
- Đơn bán hàng tạo ra có dính vào hệ thống ProductBatch hay tính toán Profit cũ không? Kiểm tra kỹ lại `productInventory.service.js` aggregate theo branch mới.
