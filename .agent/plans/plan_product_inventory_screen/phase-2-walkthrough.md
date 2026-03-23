# Phase 2 Walkthrough: Service tính toán & helper

**Plan:** PLAN_PRODUCT_INVENTORY_SCREEN  
**Ngày triển khai:** 2026-03-21  
**Trạng thái:** ✅ Hoàn thành

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Xây dựng `productInventory.service`
- [x] Tạo file `BE/src/services/productInventory.service.js` với 2 API chính `getInventoryOverview()` và `getInventoryDetail()` kèm toàn bộ helper aggregate.
- [x] Tính toán tổng tồn, giá trị tồn, doanh thu, giá vốn, lợi nhuận, manual export (phiếu xuất thủ công) và cảnh báo thiếu snapshot cost.
- [x] Hỗ trợ filter kho, từ khóa sản phẩm, alert-only, date range mặc định 30 ngày.  
- [x] Map chi tiết lịch sử (imports, sales, manual exports) và cảnh báo low stock.
- [x] Xuất service mới trong `BE/src/services/index.js`.

### Task 2: Unit test cấp service
- [x] Thêm file `BE/tests/unit/services/productInventory.service.test.js` (mock models) để cover overview merge + detail payload + notFound.
- [x] Test pass qua `npm test -- productInventory.service.test.js`.

---

## ⚠️ Risks/Issues phát hiện

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Chưa có controller/route => không thể gọi API từ FE | Medium | Cần Phase 3 nối route/controller + Joi | ⏳ Chưa thực hiện |
| Legacy lint prettier/security vẫn đỏ | Low | Giống Phase 1, ngoài scope | 👉 Bỏ qua tạm |

---

## 🧪 Hướng dẫn Manual Test (tạm thời qua script/service)

> Vì chưa có endpoint, có thể tạm test bằng cách mở Node REPL trong thư mục `BE` và require service.

1. `node` → `const { productInventoryService } = require('./src/services');`
2. `await productInventoryService.getInventoryOverview({ warehouse: '<warehouseId>' }, { limit: 5, page: 1 });`
   - Kiểm tra `summary`, `warnings`, `results[].stockByWarehouse` khớp dữ liệu Mongo.
3. `await productInventoryService.getInventoryDetail('<productId>', { warehouse: '<warehouseId>', startDate: '2024-02-01', endDate: '2024-02-29' });`
   - Đối chiếu `profitSummary` = doanh thu - giá vốn - manual cost (có thể tự tính từ Sale/InventoryTransaction collection).
   - Xác minh `histories.imports/sales/manualExports` trả đúng số dòng (<=10) và sort theo thời gian giảm dần.
4. Thử truyền `alertOnly: true` vào overview để chắc service chỉ trả sản phẩm tồn < minStock.
5. Thử nhập `startDate > endDate` → mong đợi `ApiError 400 "Khoảng thời gian không hợp lệ"`.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/services/productInventory.service.js` | Created | Service aggregate tồn kho + giao dịch + helper history. |
| `BE/src/services/index.js` | Modified | Export service mới. |
| `BE/tests/unit/services/productInventory.service.test.js` | Created | Unit tests cover overview/detail/notFound case. |

---

## 🔗 Liên kết sang Phase tiếp theo

- Phase 3 cần controller/route (`productInventory.controller/route`) + Joi validation gọi các hàm vừa tạo.
- Cần phân quyền (`auth('getProducts')` hoặc quyền riêng) trước khi mở API ra FE.
