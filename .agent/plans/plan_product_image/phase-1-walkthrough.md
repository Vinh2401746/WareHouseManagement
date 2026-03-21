# Phase 1 Walkthrough: Hạ tầng lưu ảnh

**Plan:** PLAN_PRODUCT_IMAGE
**Ngày triển khai:** 2026-03-21
**Trạng thái:** ⚠️ Hoàn thành có lưu ý

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Bổ sung cấu hình & schema
- [x] Thêm trường `imagePath` (private) vào `Product` schema để lưu đường dẫn ảnh tương đối
- [x] Cập nhật `config.js` với nhóm cấu hình `file` (uploadDir, productDir, publicPrefix)
- Files changed: `BE/src/models/product.model.js`, `BE/src/config/config.js`

### Task 2: Cấu hình static endpoint & ignore uploads
- [x] Khởi tạo thư mục uploads khi boot app và mount `/static` phục vụ file tĩnh
- [x] Bổ sung `uploads/` vào `.gitignore` để tránh commit file ảnh
- Files changed: `BE/src/app.js`, `BE/.gitignore`

---

## ⚠️ Risks/Issues phát hiện (nếu có)

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Lint sẵn có trong codebase | Medium | `npm run lint` đang fail do các lỗi prettier/import ở những file chưa đụng tới (`inventoryTransaction.controller`, `product.service`, ...). | ⏳ Chưa cover |
| Test phụ thuộc Mongo replica set | Medium | `npm test` thất bại vì Mongo test config yêu cầu replSet (`MongoError: cannot use non-majority 'w' mode "majority-test"`). | ⏳ Chưa cover |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- Server đã được build và chạy với cấu hình mới

### Test Steps
1. Start BE server (`npm run dev`).
2. Truy cập `http://localhost:<port>/static` để kiểm tra endpoint trả 404 (vì chưa có file) thay vì 500.
3. Tạo thủ công file `uploads/test.txt` rồi truy cập `http://localhost:<port>/static/test.txt` để xác nhận file public được phục vụ.

### Expected Results
- BE khởi động không lỗi even nếu thư mục `uploads/` chưa tồn tại.
- Endpoint `/static/...` trả file tương ứng.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/models/product.model.js` | Modified | Bổ sung trường `imagePath` (private). |
| `BE/src/config/config.js` | Modified | Định nghĩa cấu hình upload/static. |
| `BE/src/app.js` | Modified | Tạo thư mục uploads và mount static endpoint. |
| `BE/.gitignore` | Modified | Bỏ qua thư mục `uploads/`. |

---

## ➡️ Next Phase Dependencies

- Phase 2 cần dựa vào `config.file.*` và trường `imagePath` vừa thêm.
- Cần user confirm kết quả phase 1 (đặc biệt việc lint/test đang fail do vấn đề sẵn có) trước khi tiếp tục.
