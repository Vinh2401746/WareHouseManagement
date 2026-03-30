# Kế hoạch & Checklist Kiểm Thử Toàn Diện (Full Project QA)

## Mục đích
Thực hiện kiểm thử toàn bộ hệ thống Phần mền Quản lý Kho (Warehouse Management), bao phủ cả Frontend (`ware-house-fe`) và Backend (`BE`).  
Phương pháp tiếp cận: Thực hiện test từng Phase (UI, Responsive, API, Security...).

## Phạm Vi Kiểm Thử
- **Target:** Tính năng hệ thống, Frontend UI (React.js/Vite) & Backend (Express, MongoDB).
- **Môi trường:** Localhost (FE port `5173`, BE port `3000`).
- **Pages/Routes chính:** 
  - Login / Auth
  - Dashboard
  - Quản lý Sản phẩm (Products), Doanh mục (Category), Đơn vị tính (Unit).
  - Quản lý Kho (Warehouse), Nhập/Xuất kho (Import/Export).
  - Quản lý Bán hàng (Sales), Khách hàng (Branch).
  - Quản lý Nhà cung cấp (Supplier).
  - Quản trị User, Phân quyền (Roles & Permissions).

---

## Các Bước Theo Quy Trình `/test`

### Phase 0: Setup & Scope Definition
- [x] Xác minh workspace & tech stack (FE: React/Vite, BE: Node/Express/Mongoose).
- [x] Xác định phạm vi test: Toàn bộ module chức năng.
- [x] Kiểm tra trạng thái server: Cả hai server FE (5173) và BE (3000) đang lắng nghe.
- [x] Xác nhận Account / Credentials test môi trường dev từ User.

### Phase 1: Giao Diện Người Dùng (UI Testing)
- [x] **Auth:** Kiểm thử Màn hình Đăng nhập (thành công, thất bại, validation input). -> ✅
- [x] **Dashboard:** Kiểm tra hiển thị tổng quan (Stats, Charts), Layout chuẩn. -> ❌ (BLOCKED - Lỗi 404 Typo)
- [x] **Modules tính năng (Products, Warehouse...):** -> ❌ (BLOCKED - Lỗi 403 Phân Quyền)

### Phase 2: Responsive Testing
- [x] Kiểm thử qua thiết bị Mobile/Tablet trên các tính năng quan trọng (Layout stack, Sidebar behavior, Responsive table hiển thị). -> ⚠️ (Chưa thể test sâu do Blocked)

### Phase 3: API & Chức Năng Cốt Lõi (API/Integration Testing)
- [x] **RBAC & Auth:** Token expiry, Không có quyền truy cập endpoint nhạy cảm (401, 403). -> ❌ (User bị từ chối truy cập)
- [x] **Happy Path Validation:** Tạo Sản phẩm, Nhập/Xuất kho. -> ⚠️ (Blocked on UI, reviewed on code)

### Phase 4: Database & Bảo Mật (DB & Security Testing)
- [x] Đánh giá Data Types và Indexes (User, Product, InventoryTransactions...).
- [x] Input handling & Validation.
- [x] Security: Kiểm tra Scope access đa chi nhánh (Phát hiện BUG-004 - Lỗ hổng Insecure Direct Object Reference).

### Phase 5 & 6: Tổng Hợp, Tạo Báo Cáo & Bug Log
- [x] Lập Bảng Test Cases chi tiết cho các ca fail.
- [x] Viết Bug Report cụ thể với Screen/Error logs.
- [x] Sinh Báo Cáo Chất Lượng Tổng Quan (Summary Report).

---

## Báo Cáo Bug (Bug Reports)

### 🐛 BUG-001: Lỗi cấu hình Port API khiến màn hình đăng nhập bị từ chối kết nối (Đã fix)
- Cấu hình baseURL bị sai (Port 4000 thay vì 3000). Đã được User fix trong quá trình test.

---

### 🐛 BUG-002: Lỗi 404 Dashboard do cấu hình sai thư mục/đường dẫn 
| Field | Value |
|-------|-------|
| **Severity** | P1 (Blocker) |
| **Category** | UI / Routing |
| **Location** | `ware-house-fe/src/router/routes.tsx` hoặc cấu trúc thư mục pages |

**Mô tả:**
Sau khi đăng nhập thành công vào hệ thống, ứng dụng điều hướng đến route `/dashboard` nhưng bị lỗi React Route 404. Hệ thống báo không tìm thấy file, có khả năng do sai chính tả (Typo) ở tên folder (VD: `dardboard` thay vì `dashboard`) hoặc thiết lập alias đường dẫn bị sai. 

---

### 🐛 BUG-003: Lỗi 403 Forbidden (Không có quyền thao tác phân hệ Sản phẩm / Các tính năng chính)
| Field | Value |
|-------|-------|
| **Severity** | P1 (Blocker) |
| **Category** | API / Authorization |
| **Location** | Các API `/products`, `/permissions`, truy cập qua UI |

**Mô tả:**
Khi sử dụng tài khoản `admin@gmail.com` (SuperAdmin), người dùng không thể điều hướng tới các module như Sản phẩm, Quản lý kho. UI hiển thị màn hình fallback lỗi: "Bạn không có quyền thao tác". Có một lỗi trong logic xác thực trả về 403 Forbidden cho user này.
- **Root Cause dự kiến**: Dữ liệu DB (seeds) chưa ánh xạ đúng role SuperAdmin tới các chức năng, hoặc middleware `auth()` đang xử lý sai permission cho global scope.

---

### 🛡️ BUG-004: Lỗ hổng bảo mật: Thiếu kiểm tra Scope đa chi nhánh (IDOR) trong Product API
| Field | Value |
|-------|-------|
| **Severity** | P1 (Critical Security) |
| **Category** | Security |
| **Location** | `BE/src/controllers/product.controller.js` (các hàm: getProduct, updateProduct, deleteProduct) |

**Mô tả:**
Kiểm thử mã nguồn (Phase 4) cho thấy các API lấy thông tin, cập nhật, xóa sản phẩm bằng ID *KHÔNG* truyền biến `scopeContext`. 
Hệ quả: Một Admin từ `Chi nhánh A` (chỉ có quyền trong Branch A) nếu biết được `productId` của sản phẩm thuộc `Chi nhánh B` (hoặc sản phẩm chung), thì hoàn toàn có thể sử dụng endpoint `PUT /v1/products/:productId` và `DELETE /v1/products/:productId` để sửa/xóa nó trái phép.

**Suggested Fix:**
Cập nhật trong file `product.controller.js`:
Bổ sung `const scopeContext = buildScopeContext(req);` và truyền context này vào các hàm trong `productService` để xác thực ownership/chi nhánh.
