# Phase 1, 2 & 3 Walkthrough: Triển khai toàn diện Module Customer

**Plan:** plan_customer_management
**Ngày triển khai:** 2026-04-05
**Trạng thái:** ✅ Hoàn thành

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Backend Updates (API & Business Logic)
- [x] Tạo hằng số permission `customers` tại `permission.constant.js`.
- [x] Sửa Response Messages cho Khách hàng (`customer.notFound`, `customer.cannotDeleteWithSales`).
- [x] Cập nhật logic ràng buộc xoá (`BE/src/services/customer.service.js`): Chặn việc xoá nếu hoá đơn `Sale` > 0.
- [x] Cập nhật API lấy `Sale` (`sale.validation.js` & `sale.controller.js`): Cho phép filter theo ID của Khách hàng (`customer`) để hỗ trợ trang chi tiết hiển thị lịch sử mua của 1 KH.

### Task 2: Frontend Types & Cấu hình Routes
- [x] Thêm permission `customers` vào `auth.ts` type.
- [x] Chuyển đổi route mapping `AppRoutes.customer` sang "customers" trong Menu Router config.
- [x] Bổ sung interface `Customer` (email, note).
- [x] Khai báo `/customer/:id` trong `AppRoutes` và mount lazy load vào `routers.tsx`.
- [x] Khai báo `getCustomerByIdApi` trong `api/customer.ts`

### Task 3: Cập nhật View Customer Form & Khởi tạo Detail Page
- [x] Sửa `index.tsx`: Bổ sung tham số `name` để thực hiện tìm kiếm, đổi quyền `usePermission` sang "customers", thay đổi nút đôi OnRow double click dẫn về `navigate('/customer/:id')`.
- [x] Sửa Component form `CustomerFormModal.tsx`:
  - Cập nhật thêm Component `Select` để chọn Chi Nhánh (Chỉ Super Admin mới thấy, do logic `usePermission("customers").isSuperAdmin`).
  - Thêm trường `email` và `note`.
- [x] Mới hoàn toàn chức năng Detail `detail.tsx`:
  - Hiển thị đầy đủ Thông tin cơ bản: Tên, SĐT, Email, Tình trạng công nợ, vv...
  - Load danh sách các hoá đơn bán hàng đã từng mua (sử dụng parameter `customer` vừa mới cho phép bên BE).

---

## ⚠️ Risks/Issues phát hiện (nếu có)

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Lỗi import `getBranchesApi` bị sai tên hàm ở API (Typo gốc là `getBranchsApi`) | Medium | Hệ quả do Dev cũ viết sai tên, đã check và update FE kịp thời tự mapping. | ✅ Đã xử lý |
| Lỗi Route deleteInvoiceApi (Frontend) | High | Call sai endpoint (`/supplier/id` thay vì `/sale/id`), phát hiện ngẫu nhiên trong lúc check các Sales API. | ✅ Đã Fix nóng |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- Hãy đăng nhập bằng quyền Admin/Super Admin để có đầy đủ tính năng.

### Test Steps
1. **Tìm kiếm & Phân quyền**: Vào mục Khách hàng, thử gõ search bar tìm 1 tên nào đó. (Dữ liệu sẽ debounce và filter).
2. **Thêm Khách Hàng (Tài khoản Super Admin)**: 
   - Bấm nút THÊM, form đã xuất hiện thêm Dropdown chọn "Chi nhánh" cho phép Admin phân bổ KH về chi nhánh mong muốn.
   - Nhập thêm thông tin Email, Ghi chú.
3. **Lịch sử & Trang chi tiết**: 
   - Double click vào dòng tên khách hàng, trình duyệt tự nhảy URL sang `/customer/:id`.
   - Kiểm tra thông tin hiển thị và Click qua Tab xem Lịch sử đơn hàng có trùng khớp không.
4. **Validation Xoá Cứng**: 
   - Quay lại list và xoá thử khách đó. (Sẽ xoá được do họ chưa từng mua hàng).
   - Chọn một khách hàng ĐÃ mua hàng và thử xoá. Hệ thống BE sẽ bật Alert chặn hành động này.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/constants/...` | Modified | Thêm Permisson, Error Message |
| `BE/src/services/customer.service.js` | Modified | Logic xoá an toàn ràng buộc Sale |
| `BE/src/controllers & validations (Sale)` | Modified | Filter customer được phép pass qua getSales query |
| `fe/.../usePermission.ts` | Modified | Xuất hook trả thêm `isSuperAdmin` |
| `fe/.../layouts & router & Api` | Modified | Các config setup cho Form mới |
| `fe/.../customers/index.tsx` | Modified | List page + Search function + Redirections |
| `fe/.../customers/components/create-update-customer.tsx` | Modified | Form Detail + Fix Error Missing Branch Admin |
| `fe/.../customers/detail.tsx` | Created | Trang thông tin hiển thị giao dịch Timeline KH |
