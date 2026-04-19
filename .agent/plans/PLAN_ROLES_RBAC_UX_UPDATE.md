# PLAN: Update Roles (RBAC UI) — Contract Alignment & Superadmin-only UX

## Mục tiêu

- Làm cho màn **Vai trò & Phân quyền (Roles)** hoạt động đúng theo RBAC động hiện có ở BE và **chỉ Superadmin** mới truy cập được.
- Đồng bộ “contract permissions” giữa BE và FE để mọi quyết định show/hide + canView/isManager cho Roles **không bị false-deny**.
- Đảm bảo **menu + truy cập trực tiếp URL** nhất quán: không có quyền → thấy NoPermission ngay, không bị màn trống/console error.

## Non-goals (chưa làm ở phase này)

- Không thiết kế thêm màn/flow mới cho RBAC (ngoài việc gating + sửa contract + sửa form hiện có).
- Không thêm permission mới kiểu `getRoles/getPermissions` (BE hiện dùng `manageRoles` cho cả read/write; vì RBAC UI đã chốt “Superadmin-only” nên chưa cần tách).
- Không refactor toàn bộ hệ thống permission cho các module khác (Products/Warehouse/...) trừ các thay đổi “hệ thống” bắt buộc để Roles chạy đúng (contract + hook dùng chung).

## Bối cảnh hiện trạng

### Backend (BE)
- API Roles đã có sẵn và được bảo vệ bằng `auth('manageRoles')`:
  - List/Create: [BE/src/routes/v1/role.route.js](BE/src/routes/v1/role.route.js#L9-L12)
  - Get/Update/Delete: [BE/src/routes/v1/role.route.js](BE/src/routes/v1/role.route.js#L14-L18)
- Service `role.service.js`:
  - Normalize `key` lowercase + unique, resolve `permissionIds` thành `permissions` ObjectId, chặn sửa/xoá role immutable/system/in-use.
  - Xem [BE/src/services/role.service.js](BE/src/services/role.service.js#L20-L148)
- `GET /v1/users/me/permissions` trả payload **permissionsByGroup**:
  - [BE/src/services/user.service.js](BE/src/services/user.service.js#L195-L225)

### Frontend (FE)
- Trang Roles: [ware-house-fe/src/pages/app/roles/index.tsx](ware-house-fe/src/pages/app/roles/index.tsx)
  - Hiện đang gate bằng `usePermission("user")` → sai module.
  - [ware-house-fe/src/pages/app/roles/index.tsx](ware-house-fe/src/pages/app/roles/index.tsx#L19)
- Menu mapping route → module đang map `AppRoutes.role` về `"user"`:
  - [ware-house-fe/src/layouts/menus/menu.tsx](ware-house-fe/src/layouts/menus/menu.tsx#L23-L25)
- Hook `usePermission` đang đọc sai state và sai field:
  - Đọc `state.auth.user` (không tồn tại trong store) và `state.auth.permission?.permissions` (FE type), trong khi BE trả `permissionsByGroup`.
  - [ware-house-fe/src/hooks/usePermission.ts](ware-house-fe/src/hooks/usePermission.ts#L7-L28)
- FE gọi permissions qua `GET users/me/permissions`: [ware-house-fe/src/api/users/users.ts](ware-house-fe/src/api/users/users.ts#L50-L52)

## Yêu cầu nghiệp vụ (đã chốt)

- **RBAC UI (Roles/Permissions)** chỉ **Superadmin** được dùng.
- Roles/Permission contract dùng permission code pattern `getX/manageX` và grouping theo `group` (BE format theo group).
- UX không quyền phải nhất quán: vào trực tiếp URL Roles mà không phải Superadmin → hiển thị NoPermission.

## Thiết kế UX / Flow

### Flow 1: User mở menu “Vai trò & Phân quyền”

- Nếu user là **Superadmin**: menu item hiển thị và vào trang Roles bình thường.
- Nếu không phải Superadmin: menu item **không hiển thị**.

### Flow 2: User truy cập trực tiếp URL `/roles` (hoặc AppRoutes.role)

- Nếu user là **Superadmin**: render trang Roles.
- Nếu không: render [ware-house-fe/src/pages/404-developing/no-permission.tsx](ware-house-fe/src/pages/404-developing/no-permission.tsx).
- Trong lúc permissions chưa load xong: hiển thị trạng thái loading (tránh “flash deny”).

### Flow 3: CRUD Roles trong trang Roles

- List roles: gọi `GET /v1/role`.
- Create/update role: gửi `permissionIds: string[]` (ObjectId) theo BE validation.
- Update key: FE đã disable key khi edit; BE cũng enforce unique.
- Delete role: BE chặn nếu role system/immutable/in-use; FE hiển thị toast theo message trả về.

## Thiết kế Data Model

### Mục tiêu

- FE type và state phải phản ánh đúng payload BE trả về để `usePermission` hoạt động ổn định.

### Đề xuất schema (FE types)

- Cập nhật permission payload type để khớp BE:
  - `permissionsByGroup` thay cho `permissions`
  - bổ sung `roleId`, `roleKey`, `roleName`

### Tương thích & Migration

- Không cần migration dữ liệu DB.
- FE: cần update code ở nơi đang đọc `permission.permissions` sang `permission.permissionsByGroup`.

## Thiết kế kỹ thuật / Kiến trúc

### 1) Đồng bộ contract permissions (FE)

- Update type [ware-house-fe/src/types/auth.ts](ware-house-fe/src/types/auth.ts) để match BE `getMyPermissions`.
- Update saga permissions fetch:
  - [ware-house-fe/src/store/sagas/auth.ts](ware-house-fe/src/store/sagas/auth.ts#L66-L92)
  - Validate payload dựa vào `userId` + `permissionsByGroup`.

### 2) Sửa `usePermission` (FE)

- Đọc đúng state:
  - User info nằm trong `state.user.user` (vì root reducer tách `auth` và `user`):
    - [ware-house-fe/src/store/root-reducer.ts](ware-house-fe/src/store/root-reducer.ts#L5-L6)
- Đọc đúng permissions:
  - `state.auth.permission?.permissionsByGroup`
- Chuẩn hoá rule canView/isManager:
  - Không áp dụng rule “`manageX` ⇒ `canView`” (theo chốt mới).
  - Với RBAC UI (Roles/Permissions): **chỉ Superadmin** (isSuperAdmin check theo `roleKey`).

### 3) Menu gating (FE)

- Với menu item Roles/Permissions: bypass permission-group, check thẳng `isSuperAdmin`.
  - Hiện tại map sai: [ware-house-fe/src/layouts/menus/menu.tsx](ware-house-fe/src/layouts/menus/menu.tsx#L23-L25)
- Sửa cách detect superadmin:
  - Dựa vào `state.user.user.roleKey === 'superadmin'` (ưu tiên), fallback `state.auth.permission.roleKey`.

### 4) Roles page gating (FE)

- Bỏ gating theo module permission cho màn này; gate trực tiếp bằng `isSuperAdmin` (theo rule đã chốt).
  - [ware-house-fe/src/pages/app/roles/index.tsx](ware-house-fe/src/pages/app/roles/index.tsx#L19)
- Thêm xử lý loading khi permission chưa có (tránh flash NoPermission ngay sau login).

### 5) Fix Role form mapping permissions (FE)

- Khi edit role, FE đang set `permissionIds` từ `data.permissionIds` nhưng BE trả `permissions` (populate).
  - Update để lấy từ `data.permissions` nếu có.
  - File: [ware-house-fe/src/pages/app/roles/components/creat-update-role.tsx](ware-house-fe/src/pages/app/roles/components/creat-update-role.tsx)

## Các thay đổi dự kiến trong code

### Backend
- Không cần đổi BE cho Roles (đã enforce `manageRoles`).
- (Tuỳ chọn future) Nếu muốn read-only RBAC cho role khác Superadmin, mới cần tách permission `getRoles/getPermissions`.

### Frontend
- [ware-house-fe/src/types/auth.ts](ware-house-fe/src/types/auth.ts):
  - Update `permissionType` → `{ userId, roleId, roleKey, roleName, permissionsByGroup }`.
  - Thêm group `rbac` trong `permissionsByGroup` (vì BE `manageRoles/managePermissions` có `group: 'rbac'`).
- [ware-house-fe/src/hooks/usePermission.ts](ware-house-fe/src/hooks/usePermission.ts):
  - Đọc `state.user.user`, `state.auth.permission.permissionsByGroup`.
  - Rule `canView = isSuperAdmin || hasGet || hasManage`.
  - Rule `isManager = isSuperAdmin || hasManage`.
- [ware-house-fe/src/layouts/menus/menu.tsx](ware-house-fe/src/layouts/menus/menu.tsx):
  - Fix `ROUTE_PERMISSIONS[AppRoutes.role]`.
  - Fix superadmin detection + đọc đúng state.
- [ware-house-fe/src/pages/app/roles/index.tsx](ware-house-fe/src/pages/app/roles/index.tsx):
  - Gate theo `rbac` hoặc `isSuperAdmin`, thêm loading handling.
- [ware-house-fe/src/pages/app/roles/components/creat-update-role.tsx](ware-house-fe/src/pages/app/roles/components/creat-update-role.tsx):
  - Map permissionIds đúng từ `role.permissions` khi edit.

## Logging & Bảo mật

- Không log permission payload hoặc token ở FE console trong production.
- RBAC UI chỉ hiển thị cho Superadmin; BE vẫn enforce bằng `auth('manageRoles')`.

## Rủi ro / Edge cases

- **Permissions chưa load**: page có thể false-deny → cần loading state.
- **BE trả role permission populate khác shape**: modal edit cần defensive mapping (ưu tiên `role.permissions`, fallback các field cũ nếu có).
- **Role key casing**: BE normalize lowercase; FE nên so sánh lowercase.

## Test plan

### Happy paths

1) **Superadmin**
- Login superadmin → menu có “Vai trò & Phân quyền” → vào Roles list ok.
- Create role với permissions → list thấy role mới.
- Update role description/scope/permissions → reflect đúng.
- Delete role (không system/in-use) → thành công.

2) **Non-superadmin**
- Login user thường → menu không có RBAC.
- Truy cập URL roles trực tiếp → thấy NoPermission.

### Edge cases

- Permissions API trả chậm: Roles page hiển thị loading, không flash NoPermission.
- Delete role đang được gán cho user: BE trả 400 với message; FE hiển thị toast đúng.
- Update role immutable: BE trả 403; FE hiển thị toast message.

### Regression

- Verify các module khác vẫn render bình thường khi permission contract đổi (menu gating + `usePermission` dùng chung).

## Những điểm dễ thay đổi trong tương lai

- Nếu muốn cho Admin “xem” RBAC nhưng không chỉnh sửa: thêm `getRoles/getPermissions` và tách route read/write.
- Có thể chuyển từ heuristic `includes('get'/'manage')` sang policy map route/action → permission code.

## Nơi nên tách module/hàm

- `selectIsSuperAdmin(state)`: selector tập trung cho superadmin check.
- `hasPermission(permissionsByGroup, groupKey, actionPrefix)`: helper để tránh lặp `join().includes()`.
