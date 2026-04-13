# Phase 2 Walkthrough: Frontend — Preview A4 + Export PDF + QR + Permission

**Plan:** PLAN_EXPORT_PDF_INVOICE
**Ngày triển khai:** 2026-04-08
**Trạng thái:** ✅ Hoàn thành

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Align permission module
- [x] Map menu `AppRoutes.sales_invoice` sang module `sales`.
- [x] Trang Sales list chuyển `usePermission("sales")`.

### Task 2: Preview hóa đơn A4 (Modal)
- [x] Thêm action **Xem trước** (🔍) trên mỗi dòng.
- [x] Fetch chi tiết bằng `GET /v1/sale/:saleId` và render `InvoiceA4` trong `Modal`.
- [x] Loading state bằng `Spin`.

### Task 3: Tải PDF (từ list & từ modal)
- [x] Thêm action **Tải PDF** (📥) trên mỗi dòng + nút trong modal.
- [x] Render hóa đơn offscreen để export PDF (tránh ảnh hưởng scale/preview).
- [x] Disable/spinner chống spam click.

### Task 4: Template hóa đơn + QR + watermark
- [x] Tạo component `InvoiceA4` (khổ A4 210×297mm), table items + totals + QR.
- [x] Watermark `"ĐÃ HỦY - CANCELLED"` khi `status === "CANCELLED"`.

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- FE chạy, đăng nhập user có quyền `getSales`.
- BE đã có thay đổi Phase 1 và chạy được.

### Test Steps
1. Vào màn `Hoá đơn bán hàng`.
2. Chọn 1 hóa đơn → click **Xem trước**.
3. Trong modal → click **Tải xuống (PDF)**.
4. Ở list → click **Tải PDF**.
5. Với hóa đơn `CANCELLED` → verify watermark trong preview & PDF.

### Expected Results
- Modal hiển thị hóa đơn A4 đầy đủ, có QR.
- File tải về tên `HoaDon_<code>.pdf`.
- Hóa đơn bị hủy có watermark `ĐÃ HỦY - CANCELLED`.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `ware-house-fe/package.json` | Modified | Thêm `html2pdf.js`, `qrcode.react` |
| `ware-house-fe/src/constants/query-keys.ts` | Modified | Thêm `QueryKeys.sales.detail` |
| `ware-house-fe/src/layouts/menus/menu.tsx` | Modified | Sales invoice map permission `sales` |
| `ware-house-fe/src/pages/app/sales/index.tsx` | Modified | Thêm preview modal + download PDF |
| `ware-house-fe/src/pages/app/sales/components/invoice_a4.tsx` | Created | Template A4 + QR + watermark |
| `ware-house-fe/src/pages/app/sales/components/invoice_a4.css` | Created | CSS A4 + page-break rules |
| `ware-house-fe/src/pages/app/sales/utils/export_invoice_pdf.ts` | Created | Export PDF util (html2pdf.js) |
| `ware-house-fe/src/types/html2pdf.d.ts` | Created | Type shim cho html2pdf.js |

---

## ➡️ Next Phase Dependencies

- Nếu muốn tăng độ tin cậy: bổ sung/repair backend tests & fixtures (nếu CI bật).
