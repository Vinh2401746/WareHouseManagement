# Phase 3 Walkthrough: Hoàn thiện controller/service & test

**Plan:** PLAN_PRODUCT_IMAGE  
**Ngày triển khai:** 2026-03-21  
**Trạng thái:** ⚠️ Hoàn thành có lưu ý

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Đồng bộ response create/update sản phẩm
- [x] `product.service` tái sử dụng `getProductById()` sau khi tạo/cập nhật để đảm bảo luôn populate `unit` và build `imageUrl` đồng nhất.
- [x] Đảm bảo update vẫn xoá file ảnh cũ trước khi trả kết quả mới.
- Files changed: `BE/src/services/product.service.js`

### Task 2: Kiểm chứng response qua integration test
- [x] Cập nhật test `product.image.test` kiểm tra `unit` trong response (create + update) và giữ nguyên cleanup ảnh.
- [x] Thử chạy `npm test -- product.image.test` (fail do MongoDB yêu cầu replica set; xem Risks).
- Files changed: `BE/tests/integration/product.image.test.js`

---

## ⚠️ Risks/Issues phát hiện (nếu có)

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Mongo test replica set | Medium | `npm test -- product.image.test` báo `MongoError: cannot use non-majority 'w' mode "majority-test"` vì môi trường không có replica set, khiến `beforeEach` không khởi tạo được `unit`. | ⏳ Chưa cover |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- Đã có ít nhất 1 `Unit` hợp lệ.
- Có token `manageProducts`.

### Test Steps
1. Gửi `POST /v1/product` (multipart) với `code`, `name`, `unit`, `minStock`, kèm `image`.
2. Quan sát response, xác nhận:
   - `unit` là object `{ id, code, name }`, không phải chuỗi.
   - `imageUrl` khác `null`.
3. Gửi `PUT /v1/product/:id` với `removeImage=true` và cập nhật `minStock`.
4. Kiểm tra response update:
   - `imageUrl = null`.
   - `unit` vẫn là object đầy đủ.
5. Truy cập `/static/...` theo URL bước 1 để chắc chắn ảnh cũ đã xoá (HTTP 404).

### Expected Results
- API trả về payload đồng nhất (unit đã populate) ở cả create/update.
- Ảnh cũ được xoá khi `removeImage=true` và không còn truy cập được qua static endpoint.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/services/product.service.js` | Modified | Tái sử dụng `getProductById` để trả kết quả đã populate sau create/update. |
| `BE/tests/integration/product.image.test.js` | Modified | Thêm assertions cho `unit` object và giữ helper hỗ trợ các kịch bản mới. |

---

## ➡️ Next Phase Dependencies

- Không còn phase tiếp theo; có thể chuyển sang review/merge sau khi môi trường test có replica set hoặc mock Mongo để chạy integration test.
- Cần user xác nhận đã hiểu rõ rủi ro về việc chưa chạy được integration test toàn diện.
