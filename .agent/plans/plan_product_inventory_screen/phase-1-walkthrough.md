# Phase 1 Walkthrough: Nền tảng dữ liệu & schema

**Plan:** PLAN_PRODUCT_INVENTORY_SCREEN  
**Ngày triển khai:** 2026-03-21  
**Trạng thái:** ⚠️ Hoàn thành có lưu ý (lint đang fail vì lỗi prettier/cấu hình có sẵn, chưa thuộc phạm vi phase này)

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Bổ sung snapshot cost cho schema & service
- [x] Thêm trường `costPrice`, `costTotal` cho `Sale.items` và `InventoryTransaction.items`.  
- [x] Cập nhật `sale.service` để snapshot giá vốn từ `ProductBatch.importPrice` trong cả hai nhánh: chỉ định batch sẵn và auto allocate theo FIFO.  
- [x] Đảm bảo `InventoryTransaction` được sinh từ sale cũng mang theo snapshot cost để phục vụ report.  
- Files changed: `BE/src/models/sale.model.js`, `BE/src/models/inventoryTransaction.model.js`, `BE/src/services/sale.service.js`.

### Task 2: Unit test bảo vệ snapshot logic
- [x] Cập nhật `Sale` model test để cover thêm các field snapshot mới.  
- [x] Viết mới `tests/unit/services/sale.service.test.js` (mock models) để verify `createSale()` ghi đúng `costPrice/costTotal` cho cả trường hợp có batch và auto allocate.  
- Files changed: `BE/tests/unit/models/sale.model.test.js`, `BE/tests/unit/services/sale.service.test.js`.

---

## ⚠️ Risks/Issues phát hiện

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Lint thất bại vì các lỗi prettier/regex sẵn có (ví dụ trong `inventoryTransaction.controller.js`, `product.service.js`, `product.image.test.js`...) | Medium | Không liên quan trực tiếp Phase 1; cần xử lý riêng để lint xanh. | ⏳ Chưa cover |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- Có kho, batch nhập sẵn với `importPrice` rõ ràng.
- Có user có quyền `manageSales` và token hợp lệ.

### Test Steps
1. Gọi `POST /v1/sale` với body chứa `items` chỉ định `batch` cụ thể.
2. Kiểm tra document sale vừa tạo (qua `GET /v1/sale/{id}` trong Mongo hoặc response) → mỗi `items[]` có thêm `costPrice`, `costTotal` khớp `ProductBatch.importPrice * quantity`.
3. Kiểm tra `InventoryTransaction` sinh ra (reason `SALE`) để chắc `items[]` cũng có snapshot tương tự.
4. Lặp lại với 1 sản phẩm KHÔNG truyền batch để đảm bảo API tự phân bổ và vẫn snapshot đúng (so sánh với import price của batch được trừ tồn).

### Expected Results
- `Sale.items[].costPrice` = `ProductBatch.importPrice` của batch được xuất.
- `Sale.items[].costTotal` = `costPrice * quantity` (đã làm tròn bằng `roundCurrency`).
- `InventoryTransaction.items[]` phản ánh cùng snapshot cost → dữ liệu sẵn sàng cho phase 2 aggregation.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/models/sale.model.js` | Modified | Thêm field snapshot cost cho từng dòng sale. |
| `BE/src/models/inventoryTransaction.model.js` | Modified | Thêm field snapshot cost cho dòng phiếu xuất. |
| `BE/src/services/sale.service.js` | Modified | Ghi nhận cost snapshot khi tạo sale + inventory transaction. |
| `BE/tests/unit/models/sale.model.test.js` | Modified | Bổ sung test case cover field mới. |
| `BE/tests/unit/services/sale.service.test.js` | Created | Unit test xác nhận `createSale` snapshot cost đúng. |

---

## ➡️ Next Phase Dependencies

- Phase 2 cần dữ liệu snapshot này để aggregate profit, nên không còn blocker sau Phase 1.  
- Cần user confirm trước khi tiếp tục Phase 2.
