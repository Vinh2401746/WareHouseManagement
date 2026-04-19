# Supplier Upload/Download (Excel) — Phase 1 Walkthrough

## 1) Mục tiêu

Cung cấp 3 thao tác Excel cho **Nhà cung cấp** (Supplier):

- Tải file mẫu import (`.xlsx`).
- Upload Excel để import hàng loạt (partial success).
- Export danh sách nhà cung cấp hiện có ra Excel.

## 2) Backend (BE)

### 2.1. Endpoints

Các endpoint mới được mount dưới `/v1/supplier`:

- `GET /v1/supplier/import-template`
  - Quyền: `auth('getSuppliers')`
  - Trả về: file `.xlsx` (Content-Type + Content-Disposition attachment)

- `POST /v1/supplier/import`
  - Quyền: `auth('manageSuppliers')`
  - Upload: `multipart/form-data` với field `file`
  - Chỉ chấp nhận `.xlsx` theo MVP (reject mime `.xls`)
  - Trả về JSON: `{ imported, updated, errors }`

- `GET /v1/supplier/export`
  - Quyền: `auth('getSuppliers')`
  - Query filter (optional): `name`, `phone`, `email`, `address`
  - Trả về: file `.xlsx`

### 2.2. Excel format

- Sheet: `Nhà cung cấp`
- Header row (row 1): `Tên`, `SĐT`, `Email`, `Địa chỉ`
- Template có 2 dòng sample + 1 dòng note (yêu cầu xoá sample trước khi nhập).

### 2.3. Import rules (partial success)

- Bỏ qua các dòng trống hoàn toàn.
- Validate:
  - `Tên` là bắt buộc.
  - `Email` (nếu có) validate format cơ bản.
- Upsert rule:
  1) Có `SĐT` → match theo `phone`
  2) Không có `SĐT` nhưng có `Email` → match theo `email`
  3) Không có cả `SĐT`/`Email` → match theo `name`

`errors` trả về theo từng dòng: `{ row, key, errors: string[] }`.

## 3) Frontend (ware-house-fe)

### 3.1. Supplier page buttons

Trên trang **Nhà cung cấp** có thêm 3 nút:

- **Tải file mẫu** → download blob từ `GET supplier/import-template`
- **Tải danh sách nhà cung cấp** (Import) → mở file picker accept `.xlsx`, POST `supplier/import`
- **Xuất nhà cung cấp hiện có** → download blob từ `GET supplier/export`

Các nút này follow pattern import/export đang có ở màn Product.

### 3.2. Behavior

- Import:
  - Nếu `errors.length === 0` → toast success + refetch list.
  - Nếu có lỗi → toast lỗi đầu tiên (MVP).

## 4) Manual test (end-to-end)

### 4.1. Backend

- Từ thư mục `BE/`:
  - `npm install`
  - `cp .env.example .env` (set `MONGODB_URL`, `JWT_SECRET`...)
  - `npm run seed:rbac`
  - `npm run dev`

### 4.2. Frontend

- Từ thư mục `ware-house-fe/`:
  - `npm install`
  - `npm run dev`

### 4.3. Verify flows

1) **Download template**
- Login user có quyền `getSuppliers`.
- Vào trang Nhà cung cấp.
- Click **Tải file mẫu** → tải file `supplier_import_template.xlsx`.
- Mở file và kiểm tra header đúng 4 cột.

2) **Import**
- Mở file template, xoá các dòng sample.
- Nhập 1–2 dòng NCC hợp lệ.
- Click **Tải danh sách nhà cung cấp** và chọn file `.xlsx`.
- Kỳ vọng:
  - Toast success nếu không có lỗi.
  - Danh sách refetch thấy NCC mới/được update.

3) **Export**
- Click **Xuất nhà cung cấp hiện có**.
- Kỳ vọng tải file `suppliers.xlsx`, mở ra có header + dữ liệu NCC.

## 5) Automated verification

### 5.1. Supplier integration tests (BE)

Chạy 2 suite liên quan Supplier:

- `cd BE`
- `npx jest -i tests/integration/supplier.test.js tests/integration/supplier.excel.test.js`

Kỳ vọng: PASS.

## 6) Notes / Known issues

- `npm run lint` (BE) hiện có thể fail do các file khác trong repo có Prettier/EOL warnings không liên quan trực tiếp Supplier feature. Khi cần baseline lint sạch, nên chạy `npm run prettier:fix` và xử lý dần theo từng module.
