# PLAN: Supplier Upload/Download (Excel)

## Mục tiêu

- Cho phép **tải file mẫu Excel** để nhập danh sách nhà cung cấp.
- Cho phép **upload Excel** để import nhà cung cấp hàng loạt với cơ chế **partial success**.
- Cho phép **export Excel** danh sách nhà cung cấp hiện có.
- UI đặt ngay trên trang **Nhà cung cấp** (giống flow Product).

## Non-goals (chưa làm ở phase này)

- Không thêm trường mới vào Supplier (ví dụ: **Mã NCC**) và không tạo migration.
- Không xây dựng UI hiển thị chi tiết danh sách lỗi theo từng dòng (chỉ toast theo pattern hiện có).
- Không thay đổi mô hình phân quyền hiện tại (tái sử dụng `getSuppliers`/`manageSuppliers`).

## Bối cảnh hiện trạng

- Backend đã có pattern import/export Excel hoàn chỉnh cho Product:
  - `GET /product/import-template`, `POST /product/import`, `GET /product/export`
  - Dùng `exceljs` + middleware `upload.single('file')` (multer memory storage, giới hạn 5MB).
- Supplier backend hiện chỉ có CRUD (`/supplier`, `/supplier/:id`).
- Frontend có pattern UI import/export cho Product (tạo input file, download blob) và Supplier page hiện chỉ có list + CRUD.

## Yêu cầu nghiệp vụ (đã chốt)

- **Định dạng file**: Excel `.xlsx`.
  - Ghi chú kỹ thuật: middleware upload hiện cho phép cả `.xls`, nhưng flow import hiện tại đang theo pattern `exceljs` (đọc bằng `workbook.xlsx.load(buffer)`), nên phase này **chốt chỉ nhận `.xlsx`** để tránh tình trạng “upload qua được nhưng import fail”.
- **Cột template**: `Tên`, `SĐT`, `Email`, `Địa chỉ`.
- **Upsert rule** khi import:
  - Nếu có **SĐT** → tìm supplier theo `phone`.
  - Nếu không có SĐT nhưng có **Email** → tìm theo `email`.
  - Nếu không có SĐT/Email → tìm theo `name`.
  - Tìm thấy → **update**; không thấy → **create**.
- **Partial success**: dòng lỗi vẫn tiếp tục import các dòng hợp lệ; trả về `errors` theo từng dòng.
- **UI placement**: nút download template / import / export đặt trên trang Nhà cung cấp.

## Thiết kế UX / Flow

### Flow 1: Tải file mẫu

- User vào trang Nhà cung cấp.
- Click **Tải file mẫu**.
- FE gọi `GET /supplier/import-template` với `responseType: 'blob'`.
- Trình duyệt download `supplier_import_template.xlsx`.
- Nếu lỗi → toast “Tải file mẫu thất bại!”.

### Flow 2: Import nhà cung cấp từ Excel

- User click **Tải danh sách nhà cung cấp** (import).
- FE mở file picker (accept `.xlsx`).
- FE POST multipart `file` tới `POST /supplier/import`.
- BE parse excel, validate header, xử lý từng dòng.
- Kết quả trả về:
  - Nếu `errors.length === 0` → toast “Nhập nhà cung cấp thành công!” + refetch list.
  - Nếu có lỗi → toast lỗi đầu tiên theo pattern Product (MVP).

### Flow 3: Export danh sách nhà cung cấp

- User click **Xuất nhà cung cấp hiện có**.
- FE gọi `GET /supplier/export` (blob) → download `suppliers.xlsx` (MVP, consistent với Product page).
- BE vẫn set `Content-Disposition` filename động nếu cần; FE có thể bỏ qua ở MVP.
- Nếu lỗi → toast “Xuất nhà cung cấp thất bại!”.

## Thiết kế Data Model

### Mục tiêu

- Không đổi schema; chỉ thêm hỗ trợ import/export.

### Đề xuất schema

- Không thay đổi `Supplier` model (giữ: `name`, `phone`, `email`, `address`).

### Tương thích & Migration

- Không cần migration.

## Thiết kế kỹ thuật / Kiến trúc

### Backend endpoints

Tạo 3 endpoints theo pattern Product:

- `GET /v1/supplier/import-template`
  - Permission: `auth('getSuppliers')`
  - Response: xlsx buffer + headers:
    - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    - `Content-Disposition: attachment; filename="supplier_import_template.xlsx"`

- `POST /v1/supplier/import`
  - Permission: `auth('manageSuppliers')`
  - Middleware: `upload.single('file')` (dùng sẵn `BE/src/middlewares/upload.js`)
  - Validate thực tế: chỉ nhận `.xlsx` (nếu `.xls` lọt qua mime-type thì trả 400 với message thân thiện).
  - Response 200 JSON: `{ imported, updated, errors }`

- `GET /v1/supplier/export`
  - Permission: `auth('getSuppliers')`
  - Optional filter query: `name`, `phone`, `email`, `address` (giống `getSuppliers`)
  - Response: xlsx buffer (BE có thể set filename động `suppliers_<timestamp>.xlsx`; FE MVP tải về `suppliers.xlsx`).

### Excel template & validation

- Excel sheet: `Nhà cung cấp`.
- Headers (row 1): `Tên`, `SĐT`, `Email`, `Địa chỉ`.
- Template có 2 dòng sample (in nghiêng + nền nhạt) + 1 dòng note (chữ đỏ) theo style tương tự Product.
- Khi import:
  - Validate sheet tồn tại.
  - Validate headers: thiếu cột → trả 400.
  - Row parsing:
    - Bỏ qua dòng trống hoàn toàn.
    - `Tên` bắt buộc.
    - `Email` nếu có: validate format cơ bản (MVP).
  - Upsert theo rule đã chốt.

### Error contract

- Giữ contract giống Product:
  - `imported`: số bản ghi tạo mới
  - `updated`: số bản ghi cập nhật
  - `errors`: mảng `{ row, key, errors[] }`
- Với Supplier, `key` có thể là `phone || email || name || ''`.

### RBAC

- Không thêm permission mới.
- Dùng:
  - `getSuppliers` cho template/export
  - `manageSuppliers` cho import

## Các thay đổi dự kiến trong code

### Backend

- `BE/src/routes/v1/supplier.route.js`
  - Add routes: `/import-template`, `/import`, `/export` (đặt trước `/:supplierId`).
  - Import sử dụng `upload.single('file')`.

- `BE/src/controllers/supplier.controller.js`
  - Thêm handler:
    - `getImportTemplate`
    - `importSuppliers`
    - `exportSuppliers`

- `BE/src/services/supplier.service.js`
  - Thêm hàm:
    - `getSupplierImportTemplate()`
    - `importSuppliersFromExcel(buffer)`
    - `exportSuppliersToExcel(filter)`
  - Reuse `exceljs`.

- `BE/src/validations/supplier.validation.js`
  - Thêm schema `exportSuppliers` cho query filter.

- `BE/src/constants/responseMessages.js`
  - Thêm messages cho `supplier.excel.invalidFile`, `supplier.excel.noData`, `supplier.excel.importSuccess`.
  - Lưu ý: hiện mới có `product.excel.*`, nên Supplier Excel cần thêm để đồng bộ message.

- (Optional) Swagger docs
  - Update swagger comment blocks trong `supplier.route.js` tương tự `product.route.js`.

### Frontend

- `ware-house-fe/src/api/supplier/index.ts`
  - Add API methods:
    - `getTemplateSupplier()` → GET `supplier/import-template` (blob)
    - `importTemplateSupplier(file)` → POST `supplier/import` (multipart)
    - `exportCurrentSuppliers()` → GET `supplier/export` (blob)

- `ware-house-fe/src/pages/app/suppiler/index.tsx`
  - Add 3 buttons (template/import/export) ở header actions theo pattern Product:
    - Tải file mẫu
    - Tải danh sách nhà cung cấp
    - Xuất nhà cung cấp hiện có
  - Add `useMutation` handlers cho download blob và import (copy đúng block từ Product page).
  - Import dùng `document.createElement('input')` và **chỉ accept `.xlsx`**.
  - Naming file (MVP):
    - Template: `supplier_import_template.xlsx`
    - Export: `suppliers.xlsx`

## Logging & Bảo mật

- Không log nội dung file Excel.
- Với lỗi parse/validate: trả về message thân thiện; có thể log `err.message` ở mức warn nếu cần.
- Dùng multer memory storage + limit 5MB như hiện tại.

## Rủi ro / Edge cases

- **Trùng dữ liệu không duy nhất**: Nếu DB đã có nhiều supplier cùng phone/email/name, `findOne` sẽ update bản ghi đầu tiên.
  - MVP: chấp nhận; có thể bổ sung cảnh báo trong `errors` hoặc `skipped` trong tương lai.
- **Email không hợp lệ**: Decide validate “basic” để tránh rác; email trống vẫn hợp lệ.
- **Header bị đổi tên**: BE trả 400 “thiếu cột ...” như Product.
- **File lớn**: bị chặn bởi limit 5MB.

## Test plan

### Happy paths

Backend (integration, Jest + supertest):
- `GET /v1/supplier/import-template` trả 200 + header Content-Type xlsx.
- `POST /v1/supplier/import` với file hợp lệ:
  - tạo mới 2 NCC → `imported=2`, `updated=0`, `errors=[]`.
  - import lại cùng file → `updated=2`.
- `GET /v1/supplier/export` trả 200 + body là xlsx buffer.

Ghi chú quan trọng (để tránh fail test không liên quan):
- `BE/tests/integration/supplier.test.js` hiện đang assert field `type` trong khi Supplier model/fixture đang theo `name/phone/email/address`. Cần fix lại test hiện trạng (hoặc ít nhất tách bạch để khi thêm test Excel không bị “fail noise”).
- Khi test binary download (template/export), có thể reuse pattern parse response dạng buffer tương tự `binaryParser` ở test khác.

Frontend (manual):
- Download template mở được bằng Excel.
- Import file template đã điền → list refetch.
- Export tải file xlsx chứa dữ liệu.

### Edge cases

- Upload thiếu file → 400 + toast lỗi.
- File sai mime / không phải xlsx (bao gồm `.xls`) → 400.
- Header thiếu cột → 400.
- Một vài dòng lỗi + vài dòng đúng → BE trả partial success; FE toast theo pattern.

### Regression

- CRUD Supplier hiện tại vẫn chạy bình thường.
- Product import/export không bị ảnh hưởng.

## Những điểm dễ thay đổi trong tương lai

- **Unique key**: nếu sau này thêm `supplier.code`, có thể đổi upsert sang match theo code.
- **UX lỗi import**: có thể hiển thị bảng lỗi từng dòng thay vì toast.
- **Branch scoping**: nếu Supplier cần theo chi nhánh, thêm field `branch` và áp dụng `applyBranchScope`.

## Nơi nên tách module/hàm

- `buildSupplierHeaderIndex(headersRow)` (service): map header → index.
- `parseSupplierRow(row, headerIndex)` (service): trả về `{ data, rowErrors }`.
- `resolveSupplierUpsertQuery(data)` (service): sinh query theo rule phone/email/name.
