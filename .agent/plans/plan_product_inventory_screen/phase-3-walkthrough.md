# Phase 3 Walkthrough: Routes, controller, validation & integration tests

**Plan:** PLAN_PRODUCT_INVENTORY_SCREEN  
**Ngày triển khai:** 2026-03-21  
**Trạng thái:** ✅ Hoàn thành

---

## 📋 Công việc đã làm

### API Layer
- [x] Tạo controller mới `productInventory.controller` với 2 handler `getInventoryOverview()` và `getInventoryDetail()` gọi service Phase 2.
- [x] Mở rộng `product.route` để expose:
  - `GET /v1/product/inventory-overview` – phân trang & filter tổng quan.
  - `GET /v1/product/:productId/inventory-detail` – snapshot + lịch sử.
- [x] Thêm schema Joi (`getInventoryOverview`, `getInventoryDetail`) để validate query/params (warehouse filters, date range, pagination,...).

### Permission
- [x] Bổ sung quyền mới `getProductInventory` trong `permission.constant` + group `productInventory`.
- [x] Cập nhật `config/roles` để các role **admin, storeKeeper, warehouseManager, accountant, systemAdmin** sở hữu quyền này (che giấu dữ liệu giá vốn với role còn lại).
- [x] Route mới dùng `auth('getProductInventory')` thay vì `getProducts`.

### Integration & Tests
- [x] Viết integration test `tests/integration/productInventory.test.js` (seed dữ liệu gốc: branch/warehouse/product/batch/sale/manual export) để verify cả overview & detail + permission 403.
- [x] Chạy `npm test -- productInventory` (service + integration) → pass.
- [x] Fix `config/config.js` khi nối `-test` vào `MONGODB_URL` để tách query string (tránh lỗi `w=majority-test` khi chạy Jest).

---

## ⚠️ Lưu ý / Known Issues

| Issue | Mức | Mô tả | Ghi chú |
|-------|-----|-------|---------|
| Legacy lint (prettier/security) vẫn đỏ | Low | Không phát sinh mới; user đã cho phép bỏ qua | Không xử lý trong phase 3 |
| Jest warning open handles (bcrypt, nodemailer) | Low | Tồn tại từ codebase cũ; tests vẫn pass | Có thể giải quyết riêng nếu cần |

---

## 🧪 Manual Test Guide

1. **Chuẩn bị**: tạo token của user có quyền `getProductInventory` (ví dụ Admin) và đảm bảo DB có dữ liệu sale/batch.
2. **Overview**  
   `GET /v1/product/inventory-overview` với query `warehouse=<warehouseId>&startDate=2024-01-01&endDate=2024-01-31`.  
   - Expect `results[].product` đầy đủ info, `summary.totalProfit = revenue - cost - manualCost`.  
   - Thử thêm `alertOnly=true` để xác nhận chỉ trả sản phẩm tồn < minStock.
3. **Detail**  
   `GET /v1/product/<productId>/inventory-detail?warehouse=<warehouseId>&startDate=...&endDate=...`.  
   - Expect `stockSnapshot.stockByWarehouse` hiển thị tồn từng kho, `histories.imports/sales/manualExports` tối đa 10 dòng mỗi loại, sort giảm dần.  
   - Kiểm tra `profitSummary` và `alerts` khớp logic.
4. **Permission check**  
   Dùng token role không có quyền (ví dụ `salesStaff`) gọi endpoints → `403 Forbidden`.

---

## 📁 Files chạm vào (Phase 3)

| File | Thao tác | Mô tả |
|------|----------|-------|
| `BE/src/controllers/productInventory.controller.js` | New | Controller gọi service Phase 2. |
| `BE/src/routes/v1/product.route.js` | Update | Bổ sung 2 endpoint inventory, gắn auth/validate. |
| `BE/src/validations/product.validation.js` | Update | Joi schema cho overview/detail. |
| `BE/src/constants/permission.constant.js` | Update | Quyền `getProductInventory` + group. |
| `BE/src/config/roles.js` | Update | Gán quyền mới cho các role cần xem giá vốn. |
| `BE/src/config/config.js` | Update | Fix build Mongo URL khi chạy test (loại query). |
| `BE/src/controllers/index.js` | Update | Export controller mới. |
| `BE/tests/integration/productInventory.test.js` | New | Integration test coverage.

---

## ✅ Test Result

```
npm test -- productInventory
```

(sinh warning open handles do bcrypt/nodemailer có sẵn, không ảnh hưởng kết quả)
