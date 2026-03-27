# PLAN: Super Admin RBAC

## Mục tiêu

- Thêm vai trò **superadmin** có thể xem mọi dữ liệu bất kể chi nhánh và cấu hình hệ thống RBAC.
- Chuyển hệ thống phân quyền sang mô hình động (Role & Permission lưu trong Mongo) với API CRUD cho superadmin.
- Seed dữ liệu permission/role gốc từ cấu hình hiện tại và tạo tài khoản superadmin mặc định.

## Non-goals (chưa làm ở phase này)

- Không xây dựng UI/frontend quản trị quyền (chỉ backend API + seed).
- Không thay đổi logic nghiệp vụ từng module ngoài phần kiểm soát quyền/branch.
- Không migrate dữ liệu ngoài các trường user/role/permission đã mô tả (ví dụ inventory, sales giữ nguyên).

## Bối cảnh hiện trạng

- Quyền được khai báo tĩnh tại [BE/src/constants/permission.constant.js](BE/src/constants/permission.constant.js); vai trò mapping cứng ở [BE/src/config/roles.js](BE/src/config/roles.js).
- `User` schema ([BE/src/models/user.model.js](BE/src/models/user.model.js)) lưu `role` dạng chuỗi (enum các key có sẵn) và luôn yêu cầu `branch`.
- `auth` middleware ([BE/src/middlewares/auth.js](BE/src/middlewares/auth.js)) tra cứu quyền qua `roleRights` (Map trong config), không hỗ trợ sửa lúc runtime.
- Các service/controllers (ví dụ [BE/src/services/user.service.js](BE/src/services/user.service.js)) cũng tham chiếu `roleRights`/`PERMISSION_GROUPS`, nên mọi thay đổi đều phải sửa code.
- Chưa có cơ chế seed dữ liệu hay scripts để tạo tài khoản đặc biệt.

## Yêu cầu nghiệp vụ (đã chốt)

- **Superadmin** là role mới, không bị ràng buộc chi nhánh, có thể xem toàn bộ dữ liệu và cấu hình quyền/role.
- Superadmin được phép CRUD permissions mới (không chỉ gán quyền sẵn có) và CRUD role (tên + tập permission).
- Tài khoản superadmin seed sẵn (email `admin@gmail.com`) không được chỉnh sửa/xoá qua API.
- Admin thường (chủ cửa hàng) vẫn tồn tại như một role độc lập, bị giới hạn quyền như hiện tại.
- Hệ thống RBAC chuyển sang dữ liệu động: role liên kết permission theo mô hình many-to-many.
- Cần API CRUD cho `roles` & `permissions`, chỉ superadmin truy cập.
- Cần script seed permission/role mặc định dựa trên dữ liệu hiện nay và seed tài khoản superadmin (password đã mã hoá cung cấp).

## Thiết kế UX / Flow

### Flow 1: Superadmin quản lý role/permission

1. Superadmin đăng nhập → nhận access token như user thường.
2. Gọi API `GET /v1/permissions` hoặc `GET /v1/roles` để xem danh sách.
3. Dùng `POST /v1/permissions` để tạo quyền mới (code duy nhất, mô tả, group).
4. Tạo/ cập nhật role thông qua `POST /v1/roles` & `PATCH /v1/roles/:id`, truyền danh sách `permissionIds` cần gán.
5. Hệ thống ghi log và chỉ cho phép thao tác khi bearer token thuộc superadmin.

### Flow 2: Kiểm tra quyền khi user gọi API

1. `auth(requiredRights)` vẫn được khai báo trong route.
2. Middleware tải user + populate role + permissions (hoặc cache) → dựng danh sách quyền của user.
3. Nếu `user.role.key === 'superadmin'`, bypass branch filter và quyền (hoặc coi như có toàn bộ quyền).
4. Nếu không, so khớp `requiredRights` với danh sách quyền dynamic; nếu thiếu, trả về 403.
5. Downstream controllers có thể dựa vào `req.userRole` hoặc `req.userPermissions` đã chuẩn hoá theo nhóm để xử lý UI response (ví dụ `/users/me/permissions`).

## Thiết kế Data Model

### Mục tiêu

- Persist danh sách permission và role để superadmin chỉnh sửa runtime.
- Giữ khả năng group quyền theo module (để reuse trong API `/users/me/permissions`).
- Hỗ trợ flag hệ thống (`isSystem`) để chuẩn bị ngăn xoá những quyền mặc định.

### Đề xuất schema

**Permission (mới)**
- `code` (string, unique, lowercase) – dùng trong `auth('code')` và seed từ dữ liệu cũ.
- `name` (string) – label hiển thị.
- `group` (string, optional) – mapping với `PERMISSION_GROUPS` cũ.
- `description` (string, optional).
- `isSystem` (boolean, default true cho seed) – chặn xoá/sửa code mặc định.
- `createdBy`, `updatedBy` (ObjectId User) – optional auditing.

**Role (mới)**
- `name` (string) – hiển thị.
- `key` (string, unique) – slug dùng cho logic (ví dụ `admin`, `superadmin`).
- `description` (string, optional).
- `permissions` ([ObjectId] → Permission) – quan hệ many-to-many.
- `isSystem` (boolean) – chặn xoá role lõi (admin, warehouseStaff...).
- `isImmutable` (boolean) – true cho superadmin để cấm sửa/rename.

**User (cập nhật)**
- Thay `role` từ `String enum` sang `ObjectId` tham chiếu `Role` (có thể giữ song song `roleKey` để duy trì backward compatibility trong 1 release).
- Cho phép `branch` nullable; validate branch chỉ khi role có `scope = 'branchScoped'` hoặc flag tương đương.
- Bổ sung hook/virtual để trả `role.key`/`role.name` trong JSON response (phục vụ `GET /users/me/permissions`).

### Tương thích & Migration

- Tạo migration/seed script đọc `config/roles.js` + `permission.constant.js` → insert Permission & Role documents nếu chưa tồn tại.
- Script thứ hai cập nhật toàn bộ `User` hiện hữu: map chuỗi role cũ sang Role document tương ứng (dựa vào `key`).
- Sau khi migration, giữ lại `config/roles.js` chỉ như nguồn dữ liệu seed hoặc xoá bỏ hoàn toàn.
- JWT hiện tại chỉ chứa `sub`; khi user được nạp lại sẽ có Role mới, nên không cần regenerate token.

## Thiết kế kỹ thuật / Kiến trúc

### Authorization layer

- Refactor [BE/src/middlewares/auth.js](BE/src/middlewares/auth.js) để lấy danh sách quyền từ DB:
  - Sau khi Passport gán `req.user`, populate `role` và `role.permissions` (hoặc cache role rights trong Redis/in-memory Map với TTL).
  - Nếu `requiredRights` rỗng → pass.
  - Nếu user là superadmin (`role.key === 'superadmin'`) → tự động pass.
  - Nếu không, kiểm tra `requiredRights.every((perm) => role.permissions has perm.code)`.
- Cấp phát `req.userPermissionsByGroup` bằng cách nhóm theo `permission.group` thay cho `PERMISSION_GROUPS` cứng.

### Role/Permission services

- Tuân thủ kiến trúc 3-layer: tạo `permission.service.js`, `permission.controller.js`, `permission.validation.js`, `permission.route.js`; tương tự cho role.
- Controller dùng `catchAsync`, service ném `ApiError` khi vi phạm (ví dụ code trùng, xoá system role, xoá permission đang gán role...).
- Swagger: thêm tag `RBAC` với mô tả endpoints.
- Refactor `user.controller.js#getMyPermissions` và `user.service.js#getUserPermissions` để đọc Role/Permission từ DB (không còn `roleRights`). Response nên trả `{ userId, roleKey, roleName, permissionsByGroup }` với group lấy từ `Permission.group`.

### Branch scope + Superadmin override

- Cập nhật `auth.validation.js` (register), `user.validation.js` và `user.service.js` để chỉ bắt buộc `branch` với các role có `scope = 'branchScoped'`. Với role global (ví dụ superadmin) cho phép `branch = null` mà không chạy `ensureBranchExists`.
- Ở các service cần filter theo chi nhánh (ví dụ user listing, warehouse, inventory), thêm hàm tiện ích `applyBranchScope(query, req.user)`; nếu user global → bỏ filter.
- Bảo vệ tài khoản superadmin: chặn `updateUserById` và `deleteUserById` khi target là user superadmin (theo role key hoặc email seed).
- Validation tạo/cập nhật user phải chuyển sang nhận `roleId` (ObjectId). Sau khi resolve role, kiểm tra scope rồi set/validate branch.

### Seed & tooling

- Tạo thư mục `BE/scripts/seeds/` chứa:
  - `seedPermissions.js`: đọc JSON mapping (có thể trích từ file config) và `upsert` `Permission` documents.
  - `seedRoles.js`: sử dụng permission IDs gắn vào role `key` (bao gồm superadmin, admin...).
  - `seedSuperAdmin.js`: tạo user nếu chưa tồn tại với password hash cung cấp, set `role` = Role superadmin, `branch = null`.
- Thêm npm script `"seed:rbac": "node ./scripts/seeds/seedRbac.js"` orchestrate 3 bước.
- Document hướng dẫn chạy seed trong README hoặc wiki.

## Kế hoạch triển khai theo phase

### Phase 1: Data layer & seeds

1. Tạo `Permission` và `Role` model + schema, apply plugin `toJSON/paginate`.
2. Viết seed scripts (`seedPermissions`, `seedRoles`, `seedSuperAdmin`, orchestrator `seedRbac`).
3. Chuyển đổi `config/roles.js`, `permission.constant.js` sang nguồn metadata dùng cho seed, đảm bảo không còn phụ thuộc runtime.
4. Migration script cập nhật `User.role` từ string sang reference `Role` + thêm `roleKey` (tạm thời) và cho phép `branch` nullable.

### Phase 2: Core services & middleware

1. Refactor `auth` middleware để đọc `role.permissions` từ DB và áp dụng superadmin bypass.
2. Cập nhật `user.service.js` (`getUserPermissions`, CRUD user) để làm việc với Role/Permission dynamic, bảo vệ superadmin.
3. Bổ sung helper `branchScope` và áp dụng tại các service/filter phụ thuộc chi nhánh (user, warehouse, inventory...).
4. Điều chỉnh `User` model hook/virtual để expose `roleKey/roleName` và branch optional logic.

### Phase 3: API surface & validations

1. Tạo route/controller/service/validation cho `permissions` và `roles` (CRUD, chỉ superadmin).
2. Cập nhật toàn bộ validations (`auth`, `user`, các module khác nếu sử dụng `role`) sang nhận `roleId` + branch conditional.
3. Update Swagger docs, response messages, và expose `GET /users/me/permissions` mới.
4. Thêm npm scripts, README hướng dẫn seed & quản trị quyền.

### Phase 4: Testing & stabilization

1. Viết/ cập nhật unit/integration tests cho middleware mới, CRUD role/permission, seed logic.
2. Chạy full test suite, fix regressions.
3. Viết walkthrough/manual test guide (đăng nhập superadmin, CRUD role/permission, verify branch scoping).
4. Chuẩn bị kế hoạch rollout/migration (chạy seed trước deploy, monitor logs).

## Các thay đổi dự kiến trong code

- [BE/src/constants/permission.constant.js](BE/src/constants/permission.constant.js): chuyển thành danh sách seed mặc định (giữ groups cho UI) hoặc chỉ export metadata.
- [BE/src/config/roles.js](BE/src/config/roles.js): loại bỏ map cứng; thay bằng helper đọc DB hoặc chỉ dùng trong seed script.
- [BE/src/models/user.model.js](BE/src/models/user.model.js): đổi `role` field, cho phép `branch` nullable, thêm virtual `roleKey`.
- **Files mới**: `src/models/permission.model.js`, `src/models/role.model.js`, `src/controllers/permission.controller.js`, `src/controllers/role.controller.js`, `src/services/permission.service.js`, `src/services/role.service.js`, `src/validations/permission.validation.js`, `src/validations/role.validation.js`, `src/routes/v1/permission.route.js`, `src/routes/v1/role.route.js`.
- [BE/src/middlewares/auth.js](BE/src/middlewares/auth.js): dùng role permissions dynamic + superadmin bypass.
- [BE/src/services/user.service.js](BE/src/services/user.service.js): bỏ `roleRights`, thêm hàm đọc DB, bảo vệ superadmin, build `permissionsByGroup` từ collection Permission.
- [BE/src/controllers/user.controller.js](BE/src/controllers/user.controller.js): `getMyPermissions` trả role + quyền dynamic; các endpoint CRUD user nhận `roleId`.
- [BE/src/routes/v1/index.js](BE/src/routes/v1/index.js): mount route mới `/roles`, `/permissions`.
- [BE/src/constants/responseMessages.js](BE/src/constants/responseMessages.js): thêm message cho role/permission.
- [BE/src/docs/swaggerDef.js] + component schemas cho Role/Permission endpoints.
- [BE/package.json](BE/package.json): thêm scripts seed & (optional) lint target.
- `BE/scripts/seeds/*.js`: script seed permissions, roles, superadmin user, optional CLI aggregator.
- [BE/src/validations/auth.validation.js](BE/src/validations/auth.validation.js) & [BE/src/validations/user.validation.js](BE/src/validations/user.validation.js): chuyển `role` string sang `roleId` (ObjectId), điều kiện hoá field `branch` dựa trên scope, cập nhật filter `getUsers` để hỗ trợ query theo roleId/roleKey.
- Tạo helper `src/utils/branchScope.js` (hoặc tương đương) và dùng lại tại các controller/service cần filter theo chi nhánh.

## Logging & Bảo mật

- Log lại tất cả thao tác CRUD role/permission (level info) kèm userId.
- Chỉ superadmin mới có thể truy cập route `/roles` & `/permissions`; route level `auth()` phải dùng permission code mới (`manageRoles`, `managePermissions`).
- Bảo đảm password seed không được log plaintext (dùng hash đã cho).
- Khi xoá permission, kiểm tra xem role nào đang dùng → chặn nếu `isSystem` hoặc option `force` chưa bật.

## Rủi ro / Edge cases

- **Migration lỗi mapping quyền**: nếu seed chạy trước khi code deploy, users có thể mất quyền → cần script idempotent + backup.
- **Token cũ**: user đã đăng nhập trước khi migration nhưng role mapping đổi → request đầu tiên sau deploy có thể fail do user chưa có roleId; cần migration đồng bộ + fallback (ví dụ tạm duy trì `role` string cho 1 release).
- **Xoá permission đang dùng**: phải ngăn hoặc cascade update role, tránh state inconsistent.
- **Branch null**: logic downstream giả định branch luôn tồn tại → rà soát nơi truy cập `req.user.branch` để tránh `undefined`.

## Test plan

### Happy paths

- **Seed pipeline**: chạy `npm run seed:rbac` trên DB trống → tạo đủ permission/role/superadmin.
- **Superadmin login**: đảm bảo user seed đăng nhập thành công, `GET /users` trả đủ dữ liệu không lọc chi nhánh.
- **Permission CRUD**: tạo quyền mới, cập nhật, xoá (khi không phải system), verify response schema.
- **Role CRUD**: tạo role custom với permissions, gán cho user thường, xác minh user chỉ thấy endpoint tương ứng.
- **Auth middleware**: route với `auth('manageProducts')` cho user có permission → 200; không có → 403.
- **Validation branch logic**: tạo user/register với role global (branch optional) phải thành công; với role branchScoped thiếu branch phải trả 400.

### Edge cases

- Cố gắng xoá role/permission `isSystem=true` → 400.
- Cập nhật user superadmin → 403.
- Tạo user mới mà không truyền branch nhưng role yêu cầu branch → 400; role global → 201 (bao phủ cả API register và admin create user).
- Xoá permission đang gán role khác → 400 và message rõ ràng.

### Regression

- Chạy lại toàn bộ test suite hiện có (users, auth, product...) để đảm bảo thay đổi role không phá luồng cũ.
- Manual smoke cho các endpoint sử dụng permission codes để chắc mapping dynamic hoạt động.

## Những điểm dễ thay đổi trong tương lai

- Có thể mở rộng `Permission.group` thành enum để phục vụ UI filter.
- Cho phép attach metadata cho role (ví dụ `branchScope = ['single','multi']`).
- Hỗ trợ caching layer (Redis) cho role-permission nếu số lượng lớn.

## Nơi nên tách module/hàm

- `rbac.util.js`: helper load role/permission, format theo group, cache in-memory.
- `seedRbac.js`: gom logic seed permissions/roles/users, tránh lặp lại ở script nhỏ.
- `applyBranchScope()` helper tại `src/utils/branchScope.js` để tái sử dụng khi query (controllers/services chỉ gọi 1 hàm).
