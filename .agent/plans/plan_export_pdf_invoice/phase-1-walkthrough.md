# Phase 1 Walkthrough: Backend — Scope check + Populate cho hóa đơn

**Plan:** PLAN_EXPORT_PDF_INVOICE
**Ngày triển khai:** 2026-04-08
**Trạng thái:** ✅ Hoàn thành (có lưu ý tests)

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Enforce scope cho `GET /v1/sale/:saleId`
- [x] Thêm service `getSaleDetailById(saleId, scopeContext)` áp dụng branch/warehouse scope.
- [x] Controller `getSale` build `scopeContext` và gọi `getSaleDetailById`.
- [x] Trả `404` nếu hóa đơn không tồn tại hoặc ngoài scope (tránh lộ cross-branch).

### Task 2: Populate dữ liệu đủ cho template A4
- [x] Populate `branch`, `warehouse`, `customer`, `soldBy`, `items.product` + nested `unit` với select tối thiểu.

---

## ⚠️ Risks/Issues phát hiện

| Issue | Mức độ | Mô tả | Trạng thái |
|------|--------|------|-----------|
| BE integration tests đang fail | Medium | Test timeout/mongo connect + fixtures `Sale` bị sai type (objectId/date/items) | ⏳ Chưa cover (ngoài scope feature) |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- BE chạy và có dữ liệu Sale hợp lệ trong DB.
- User đăng nhập có quyền `getSales`.

### Test Steps
1. Gọi `GET /v1/sale/:saleId` với 1 sale thuộc branch/warehouse scope.
2. Gọi `GET /v1/sale/:saleId` với 1 sale ngoài scope.

### Expected Results
- (1) Trả 200 và response có `branch`, `warehouse`, `soldBy/customer` (nếu có), và `items.product.unit` đã populate.
- (2) Trả 404.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/services/sale.service.js` | Modified | Thêm `getSaleDetailById` (scope+populate) |
| `BE/src/controllers/sale.controller.js` | Modified | Dùng `getSaleDetailById` + build scope context |

---

## ➡️ Next Phase Dependencies

- Frontend Phase 2 cần endpoint chi tiết trả đủ populate (đã có).
