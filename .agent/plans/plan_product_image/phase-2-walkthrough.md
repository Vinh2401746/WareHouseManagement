# Phase 2 Walkthrough: Chuẩn hóa middleware upload

**Plan:** PLAN_PRODUCT_IMAGE  
**Ngày triển khai:** 2026-03-21  
**Trạng thái:** ✅ Hoàn thành

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Cứng hóa upload ảnh sản phẩm
- [x] Sinh tên file dạng slug dựa trên `code/name` + timestamp để tránh trùng và dễ truy vết.
- [x] Chuẩn hóa đường dẫn tương đối lưu trong DB (POSIX) nhằm phục vụ static endpoint ổn định.
- Files changed: `BE/src/middlewares/uploadImage.js`

### Task 2: Chuẩn hóa payload & unit test
- [x] Trim/loại bỏ chuỗi rỗng cho `code`, `name`, `unit`, `package` trước khi đưa vào Joi.
- [x] Phủ unit test cho middleware (Jest: `npm test -- normalizeProductPayload` ✅).
- Files changed: `BE/src/middlewares/normalizeProductPayload.js`, `BE/tests/unit/middlewares/normalizeProductPayload.test.js`

### Task 3: Bổ sung test tích hợp cho slug tên file
- [x] Cho phép test helper override payload để kiểm chứng tên file sinh ra từ mã sản phẩm.
- [x] Thêm kịch bản đảm bảo `imagePath` bắt đầu bằng slug đã chuẩn hóa.
- Files changed: `BE/tests/integration/product.image.test.js`

---

## ⚠️ Risks/Issues phát hiện (nếu có)

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Mongo test replica set | Medium | Các bài integration test vẫn cần Mongo chạy ở chế độ replica set nên chưa thực thi được trong môi trường hiện tại. | ⏳ Chưa cover |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- BE server đã chạy cùng static endpoint `/static`.
- Có sẵn token có quyền `manageProducts`.

### Test Steps
1. Gửi `POST /v1/product` dạng `multipart/form-data` với:
   - `code="  PRĐ 001  "`, `name="  Sản phẩm demo  "`, `unit=<unitId>`, `minStock="5"`, `image=<file .png>`.
2. Kiểm tra response:
   - `imageUrl` bắt đầu bằng `/static/products/`.
   - `code`, `name` trả về đã được trim.
3. Mở `uploads/products/` trên server, xác nhận file được đặt tên theo slug `prd-001-<suffix>.png`.

### Expected Results
- Payload text được trim, không còn whitespace thừa.
- File ảnh được lưu đúng thư mục và tên file slug, có thể truy cập qua `/static/...`.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/middlewares/uploadImage.js` | Modified | Sinh tên file slug + suffix thay vì chuỗi random thuần số. |
| `BE/src/middlewares/normalizeProductPayload.js` | Modified | Trim chuỗi & chuẩn hóa số/boolean kèm cleanup hook. |
| `BE/tests/unit/middlewares/normalizeProductPayload.test.js` | Modified | Thêm test case cho hành vi mới. |
| `BE/tests/integration/product.image.test.js` | Modified | Cho phép override payload và test slug `imagePath`. |

---

## ➡️ Next Phase Dependencies

- Phase 3 sẽ tái sử dụng slug/cleanup middleware vừa bổ sung để đảm bảo controller & service luôn nhận payload sạch.
- Không cần user confirm thêm test do yêu cầu "tiếp tục Phase 3" đã được phê duyệt trong yêu cầu ban đầu.
