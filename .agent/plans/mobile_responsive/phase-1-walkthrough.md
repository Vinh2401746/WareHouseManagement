# Phase 1 Walkthrough: Hoàn thiện Mobile Responsive cho Header và Form chia cột

**Plan:** PLAN_MOBILE_RESPONSIVE.md
**Ngày triển khai:** 2026-04-[DATE]
**Trạng thái:** ✅ Hoàn thành

---

## 📋 Tóm tắt công việc đã thực hiện

### Task 1: Tinh chỉnh cấu trúc Navbar Header cho Mobile
- [x] Sử dụng `Grid.useBreakpoint` từ Ant Design.
- [x] Ràng buộc hiển thị Input tìm kiếm (Search bar) và Logo to bản chỉ khi màn hình từ size MD trở lên (`screens.md === true`).
- Files changed: `e:\Work\WareHouseManagement\ware-house-fe\src\layouts\header.tsx`

### Task 2: Hỗ trợ rớt dòng cho thanh Giỏ Hàng (Create Invoice)
- [x] Thêm breakpoint hook cho module Invoice.
- [x] Gán động layout Splitter: Sử dụng `layout="horizontal"` cho PC và `layout="vertical"` cho màn hình di động, giúp layout không bị chia nhỏ hẹp khó nhìn.
- [x] Điều chỉnh kích thước mặc định và min-max linh động trên Splitter panel tuỳ màn hình.
- Files changed: `e:\Work\WareHouseManagement\ware-house-fe\src\pages\app\sales\create_invoice.tsx`

### Task 3: Chỉnh sửa Span Form Nhập Kho 
- [x] Xoá toàn bộ cấu trúc chia 2 tĩnh `Col span={12}`.
- [x] Cài đặt `xs={24} sm={24} md={12}` nhằm chuyển về 1 cột dọc (100% width) trên Smartphone nhưng vẫn giữ 2 cột ngang trên Desktop/Tablet.
- Files changed: `e:\Work\WareHouseManagement\ware-house-fe\src\pages\app\warehouse_import_export\detail\index.tsx`

---

## ⚠️ Risks/Issues phát hiện

| Issue | Mức độ | Mô tả | Trạng thái |
|-------|--------|-------|------------|
| Lint Errors Cũ | Low | Có vài lỗi type (AxiosResponse) chưa khai báo trường `totalResults` và `canUpdate` trong files code nhưng không cản trở runtime | ⏳ Bỏ qua để ưu tiên Feature |

---

## 🧪 Hướng dẫn Manual Test

### Preconditions
- Đã chạy Dev server frontend (http://localhost:5173).

### Test Steps
1. Mở trang quản trị kho bằng trình duyệt Chrome.
2. Dùng tổ hợp phím **F12** -> Chuyển sang Device Toolbar (Crtl+Shift+M), chọn màn hình thiết bị (ví dụ iPhone 12 Pro cỡ ngang 390px).
3. Tại trang tổng, kiểm tra App Header trên cùng. Hãy xem ô tìm kiếm và Logo có tự biến mất / xếp gọn hay không.
4. Điều hướng vào trang `/sales` rồi nhấn nút Tạo đơn mới, thử kéo thả hoặc kiểm tra layout Splitter dọc.
5. Điều hướng đến giao diện *"Tạo phiếu nhập"* -> Các ô trường nhập liệu ("Người vận chuyển", "Kho", "Nhà cung cấp") có tràn hàng ngang qua 2 cột hay rớt dòng thành 1 khối duy nhất.

### Expected Results
- Header không còn bị kéo dài màn hình gây thanh cuộn ngang trang.
- Layout hoá đơn giỏ hàng được dàn xuống dưới gọn gàng trên mobile.
- Form Nhập/Xuất kho giãn đều 1 cột đẹp mắt trên thiết bị nhỏ.

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `header.tsx` | Modified | Cập nhật logic render Header responsive theo `screens` |
| `create_invoice.tsx` | Modified | Đổi layout Splitter. Cấp quyền rớt dòng giỏ Hàng |
| `detail/index.tsx` | Modified | Cập nhật Grid Span hệ thống Quản lý Nhập Xuất. |
