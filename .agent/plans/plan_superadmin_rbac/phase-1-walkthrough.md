# Phase 1 Walkthrough: Data layer & seeds

**Plan:** PLAN_SUPERADMIN_RBAC
**Ngày triển khai:** 2026-03-23
**Trạng thái:** ⚠️ Hoàn thành có lưu ý

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Permission & Role models
- [x] Thêm schema `Permission` và `Role` với plugin paginate/toJSON
- [x] Cập nhật `User` model sang tham chiếu `Role` + trường `roleKey`
- Files changed: `src/models/permission.model.js`, `src/models/role.model.js`, `src/models/user.model.js`, `src/models/index.js`

### Task 2: Seed scripts
- [x] Viết `seedPermissions`, `seedRoles`, `seedSuperAdmin`, `migrateUserRoles`, orchestrator `seedRbac`
- [x] Chuẩn hoá metadata trong `constants/permission.constant.js` và `config/roles.js`
- [x] Thêm npm script `seed:rbac`
- Files changed: `scripts/seeds/*.js`, `src/constants/permission.constant.js`, `src/config/roles.js`, `package.json`

### Task 3: Migration prep
- [x] Cho phép `branch` nullable, hook skip hash cho seed user
- [x] Metadata cũ (`PERMISSION_DEFINITIONS`, `ROLE_DEFINITIONS`) thay cho runtime mapping
- Files changed: `src/models/user.model.js`, `src/constants/permission.constant.js`, `src/config/roles.js`

---

## ⚠️ Risks/Issues phát hiện (nếu có)

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Unit/integration fixtures vẫn truyền `role` dạng chuỗi → Jest fail | High | Các test tạo user/model giả định `role` là string enum; cần cập nhật sang `roleId` hoặc mock Role phù hợp trong Phase 2/3 | ⏳ Chưa cover |
| Thiếu `Category` model nên test category fail | Medium | Kế thừa từ codebase cũ – cần tạo model thực hoặc bỏ test | ⏳ Chưa cover |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- Mongo đang chạy với dữ liệu trống hoặc sandbox
- Thiết lập biến môi trường `SUPERADMIN_PASSWORD` hoặc `SUPERADMIN_PASSWORD_HASH`

### Test Steps
1. Chạy `npm run seed:rbac`
2. Kiểm tra collection `permissions` & `roles` có dữ liệu
3. Đăng nhập bằng `admin@gmail.com` với password seed
4. Gọi `GET /v1/users` bằng token superadmin để xác nhận truy cập không bị lọc chi nhánh

### Expected Results
- Seed script hoàn tất không lỗi, log tạo/đồng bộ superadmin
- Role của user seed là `superadmin`, `branch` null
- Các role khác giữ nguyên permission mapping

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/constants/permission.constant.js` | Modified | Chuyển sang metadata cho seed + thêm quyền RBAC |
| `src/config/roles.js` | Modified | Vai trò thành định nghĩa động (scope, permission list) |
| `src/models/user.model.js` | Modified | `role` tham chiếu Role, thêm `roleKey`, branch nullable |
| `src/models/permission.model.js` | Created | Schema Permission mới |
| `src/models/role.model.js` | Created | Schema Role mới |
| `src/models/index.js` | Modified | Export Role/Permission |
| `scripts/seeds/*.js` | Created | Bộ script seed RBAC + migrate users |
| `package.json` | Modified | Bổ sung script `seed:rbac` |

---

## ➡️ Next Phase Dependencies

- Phase 2 cần cập nhật middleware/service + fixtures để xử lý Role ObjectId
- Cần user confirm: Có (hãy kiểm tra seed script + tác động test trước khi tiếp tục)
