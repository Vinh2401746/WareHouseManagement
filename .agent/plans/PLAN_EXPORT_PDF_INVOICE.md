# PLAN: Xem & Xuất Hóa đơn PDF (Khổ A4)

## Mục tiêu

- Thêm **Preview hóa đơn dạng A4** (modal) từ danh sách hóa đơn bán hàng.
- Thêm **Xuất/Tải PDF** từ (a) danh sách hóa đơn và (b) modal preview.
- Đảm bảo dữ liệu hóa đơn khi preview/export có đầy đủ: Branch, Warehouse, Customer, User (soldBy), và items (product/unit).

## Non-goals (chưa làm ở phase này)

- Render/generate PDF ở Backend.
- Template designer / nhiều mẫu hóa đơn.
- Tính năng in trực tiếp (Print) tách biệt khỏi tải PDF.
- Bổ sung field logo cho Branch (chỉ dùng logo ứng dụng hiện có).

## Bối cảnh hiện trạng

### Frontend
- Sales list page: `ware-house-fe/src/pages/app/sales/index.tsx` đang gọi `getInvoicesApi` và chưa có preview/download.
- Sales API client: `ware-house-fe/src/api/sales/index.ts` có sẵn `getInvoiceByIdApi(id)`.
- Permission hiện đang lệch: trang Sales & menu đang dùng module `inventoryTransactions`, trong khi backend phân quyền theo `sales`.

### Backend
- Endpoint chi tiết: `GET /v1/sale/:saleId` (`BE/src/routes/v1/sale.route.js`) yêu cầu quyền `getSales`.
- Service `saleService.getSaleById` hiện **không populate** (`BE/src/services/sale.service.js`).
- Lưu ý scope dữ liệu: list endpoint đã áp dụng branch/warehouse scope, nhưng endpoint chi tiết hiện đang gọi `getSaleById` trực tiếp nên **chưa kiểm soát truy cập cross-branch**.

## Yêu cầu nghiệp vụ (đã chốt)

- **Authz**: chỉ cần quyền `getSales` (View Invoices) là được preview & tải.
- **Layout A4 fix cứng**: 210 × 297 mm, preview sẽ scale để vừa màn hình.
- **QR code**: encode chuỗi tóm tắt: `Mã HĐ + Tổng phải thu + Ngày bán`.
- **Tên file PDF**: `HoaDon_[Mã-Hóa-Đơn].pdf` (vd: `HoaDon_IV-2024-001.pdf`).
- **Hóa đơn hủy**: hiển thị watermark chéo `"ĐÃ HỦY - CANCELLED"` trong cả preview & PDF.
- **Multi-page**: nếu dài > 1 trang, PDF hỗ trợ nhiều trang và **không cắt ngang** 1 dòng item (page-break-inside avoid cho `<tr>`).

## Thiết kế UX / Flow

### Flow 1 — Preview (🔍)

1. Tại `Hoá đơn bán hàng` (sales list), mỗi dòng có nút **🔍 Xem trước**.
2. Click 🔍 → fetch `GET /v1/sale/:saleId`.
3. Mở Modal (Ant Design) chứa giao diện hóa đơn A4.
4. Modal có nút **Tải xuống (PDF)** và **Đóng**.

**Loading/Errors**
- Khi đang fetch detail: hiển thị `Spin` trong modal.
- Nếu lỗi fetch: toast error + modal không mở (hoặc mở với trạng thái lỗi tối giản).

### Flow 2 — Tải PDF (📥)

- Có 2 entry:
  - Click 📥 ngay tại dòng hóa đơn (không cần mở modal).
  - Click **Tải xuống** trong modal preview.

**Behavior**
1. Click Download → disabled nút + hiển thị text “Đang xử lý...” / spinner.
2. Fetch chi tiết hóa đơn (nếu chưa có).
3. Render hóa đơn vào DOM (hidden/offscreen) và dùng thư viện capture HTML → PDF.
4. Trigger download với filename `HoaDon_${sale.code}.pdf`.

## Thiết kế Data Model

### Mục tiêu

- Không đổi schema DB; chỉ cần **trả về đầy đủ dữ liệu quan hệ** cho endpoint chi tiết hóa đơn.

### Đề xuất thay đổi (Backend populate)

#### 1) Scope check cho endpoint chi tiết (bắt buộc)

- Thay vì dùng trực tiếp `getSaleById(id)`, tạo service mới `getSaleDetailById(saleId, scopeContext)`:
  - Áp dụng branch/warehouse scope tương tự list endpoint (dựa trên `req.user.branch` và role scope) trước khi trả dữ liệu.
  - Nếu không tìm thấy trong scope → trả `404` (tránh lộ tồn tại bản ghi cross-branch).
- Controller `getSale` build `scopeContext` giống `getSales` và gọi `getSaleDetailById`.

#### 2) Populate chain cụ thể

- Trong `getSaleDetailById`, populate (select tối thiểu field cần in):
  - `branch`: `name address phone`
  - `warehouse`: `name` (và `branch` nếu template cần hiển thị chi nhánh theo kho)
  - `customer`: `name phone address`
  - `soldBy`: `name email`
  - `items.product`: `name code unit sellingPrice`
  - Nested: `items.product.unit`: `name`

### Tương thích

- Endpoint không đổi path; chỉ tăng payload response.
- Không ảnh hưởng luồng list nếu FE chỉ dùng list endpoint; preview/download luôn gọi detail endpoint.

## Thiết kế kỹ thuật / Kiến trúc

### PDF Rendering (Frontend)

**Lib đề xuất**
- `html2pdf.js` để hỗ trợ multi-page + page-break CSS (wrap `html2canvas` + `jsPDF`).
- `qrcode.react` để render QR trong template.

**TypeScript typing**
- Vì FE là TypeScript và `html2pdf.js` có thể thiếu typings, chuẩn bị 1 trong 2 cách:
  - Thêm type shim: tạo file `ware-house-fe/src/types/html2pdf.d.ts` với `declare module 'html2pdf.js';`
  - Hoặc dùng dynamic import và cast `any` trong util export (giới hạn phạm vi `any` trong 1 file).

**Cấu hình khuyến nghị**
- `jsPDF`: A4 portrait, `unit: 'mm', format: 'a4'`.
- `html2canvas`: `scale: 2` hoặc `3` để tăng độ nét.
- `pagebreak`: mode `['css','legacy']` và CSS:
  - `tr { break-inside: avoid; page-break-inside: avoid; }`
  - Đảm bảo table không bị cắt ngang dòng.

### Component structure (Frontend)

- Tách UI hóa đơn A4 thành component thuần (không phụ thuộc Modal):
  - Props: `saleDetail`, `qrText`, `showWatermark`.
  - DOM root có `ref` để export.
- Tạo helper/hook export PDF:
  - `exportInvoicePdf({ saleId, saleDetail?, filename })`
  - Quản lý state `isExporting` để disable spam click.

### Permission alignment

- Đổi `usePermission("inventoryTransactions")` → `usePermission("sales")` cho trang sales list.
- Đổi menu map `AppRoutes.sales_invoice` → `sales`.

### Status alignment (FE vs BE)

- Backend `Sale.status` chỉ có: `DRAFT | COMPLETED | CANCELLED`.
- Frontend hiện có mapping `PENDING` và `CANCELED` ở sales list.
- Quy tắc implement:
  - Với preview/download: luôn dựa vào `saleDetail.status` trả từ `GET /sale/:id`.
  - Watermark: chỉ bật khi `saleDetail.status === 'CANCELLED'`.
  - Trong sales list: normalize mapping hiển thị để không tạo nhầm logic theo `PENDING`.

## Các thay đổi dự kiến trong code

### Frontend

- `ware-house-fe/package.json`: thêm dependencies `html2pdf.js`, `qrcode.react`.
- `ware-house-fe/src/constants/query-keys.ts`: thêm `sales.detail` (hoặc tương đương) để cache invoice detail.
- `ware-house-fe/src/layouts/menus/menu.tsx`: map permission cho `AppRoutes.sales_invoice` thành `sales`.
- `ware-house-fe/src/pages/app/sales/index.tsx`:
  - Thêm 2 actions ở cột “Tuỳ chọn”: 🔍 preview, 📥 download.
  - Sửa module permission sang `sales`.
  - Sửa mapping status (DRAFT/COMPLETED/CANCELLED) để consistent.
  - Thêm modal preview + fetch invoice detail.
- (mới) `ware-house-fe/src/pages/app/sales/components/invoice_a4.tsx`:
  - Render layout A4 210×297mm, bảng items, totals, QR.
  - Watermark khi `status === 'CANCELLED'`.
- (mới) `ware-house-fe/src/pages/app/sales/utils/export_invoice_pdf.ts`:
  - Hàm export PDF từ DOM ref bằng html2pdf.js + filename rule.
- (mới) `ware-house-fe/src/pages/app/sales/components/invoice_a4.css` (nếu cần):
  - CSS page-break rules + word-wrap.

### Backend

- `BE/src/services/sale.service.js`:
  - Tạo `getSaleDetailById(saleId, scopeContext)` (scope + populate) và controller `getSale` chuyển sang dùng hàm này.

### Tests (Backend)

- Update `BE/tests/integration/sale.test.js`:
  - Case `GET /v1/sale/:saleId` assert có `branch`, `warehouse`, `soldBy/customer` (nếu fixture có) và `items` populated.
- Ghi chú quan trọng: fixtures sale hiện đang dùng `faker.random.word()` cho các field cần ObjectId/items nên có thể không qua validation.
- Nếu CI/tests đang bật:
  - Fix fixtures `BE/tests/fixtures/sale.fixture.js`: dùng ObjectId hợp lệ + tạo fixtures Branch/Warehouse/User/Product tối thiểu.
  - Update assertions của `BE/tests/integration/sale.test.js` tương ứng với payload populate.

## Logging & Bảo mật

- Backend: không log payload chi tiết; chỉ log `sale.code`/`saleId` khi cần debug.
- Frontend: không đưa dữ liệu nhạy cảm vào QR ngoài các thông tin đã chốt.
- Auth: mọi fetch detail đều dùng bearer token; không có endpoint public.

## Rủi ro / Edge cases

- **Tên SP quá dài**: CSS `word-break: break-word;` + giới hạn max-width trong cell.
- **Dữ liệu chưa populate**: nếu BE chưa deploy thay đổi populate, FE template phải handle ID-string/null (fallback text).
- **Multi-page performance**: hóa đơn quá dài sẽ render chậm; dùng loading state + disable button.
- **Canvas tainted/CORS**: hạn chế dùng ảnh external trong hóa đơn; logo dùng asset nội bộ (SVG) để an toàn.
- **Status mismatch**: FE hiện có `CANCELED` vs BE `CANCELLED` → cần normalize.
- **Cross-branch access**: endpoint chi tiết nếu không áp scope có thể lộ dữ liệu ngoài chi nhánh → bắt buộc thêm scope check cho `GET /sale/:id`.

## Test plan

### Happy paths

1. **Preview hóa đơn COMPLETED**
   - Vào `Hoá đơn bán hàng` → click 🔍 → modal hiện A4 đủ thông tin, không watermark.
2. **Download PDF từ modal**
   - Trong modal click “Tải xuống” → button loading → download `HoaDon_<code>.pdf` mở được và layout không vỡ.
3. **Download PDF từ list**
   - Click 📥 ở dòng → không cần mở modal → download thành công.

### Edge cases

- **Cancelled invoice**: preview & PDF có watermark `"ĐÃ HỦY - CANCELLED"`.
- **Customer null**: hiển thị `customerName` hoặc “Khách vãng lai”.
- **Long items list**: PDF multi-page, không cắt ngang dòng.
- **Spam click download**: button disabled trong lúc export.

### Regression

- Quyền truy cập menu Sales vẫn đúng theo RBAC.
- Các màn hình khác không bị ảnh hưởng bởi thay đổi `ROUTE_PERMISSIONS`.

## Những điểm dễ thay đổi trong tương lai

- **Logo Branch**: nếu thêm field `logoUrl` cho Branch, chỉ cần thay nguồn logo trong `invoice_a4.tsx`.
- **QR content**: thay đổi chuỗi encode trong util `export_invoice_pdf.ts`/component.

## Nơi nên tách module/hàm

- `InvoiceA4` component: tách riêng để reuse cho preview & export.
- `exportInvoicePdf(...)`: tách util để đảm bảo list download và modal download dùng chung logic.
