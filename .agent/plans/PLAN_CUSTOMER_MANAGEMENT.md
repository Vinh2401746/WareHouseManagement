# PLAN_CUSTOMER_MANAGEMENT

## Mục tiêu

- Hoàn thiện toàn diện module **Quản lý khách hàng (Customer Management)**.
- Phân quyền độc lập, giao diện đủ trường thông tin cơ bản.
- Xây dựng trang "Chi tiết khách hàng" nhằm quản lý lịch sử mua hàng, theo dõi công nợ tĩnh.
- Đảm bảo tính toàn vẹn của dữ liệu: Chặn việc xóa tệp khách hàng nếu đã phát sinh đơn bán hàng để tránh lỗi Data Inconsistency.

## Non-goals (chưa làm ở phase này)

- Chức năng **Thanh toán nợ / Trả góp** chi tiết từng kỳ: Sẽ được thiết kế thành một module Hệ thống Thu Chi / Quản lý dòng tiền tiêng biệt.

## Bối cảnh hiện trạng

- **Backend:** Đã có hệ thống CRUD API cơ bản (`create, get, update, delete`) và đã được liên kết với `branchScope` để phân tách chi nhánh.
- **Frontend:** 
  - Đã có trang danh sách khách hàng (`/src/pages/app/customers`) và Form thêm/sửa khách hàng.
  - Tuy nhiên, FE đang sử dụng chung quyền (`permission`) của `suppliers`.
  - Form thêm/sửa đang thiếu một số trường so với Backend (`email`, `note`).
  - Thiếu trang thông tin chi tiết khách hàng và Lịch sử đơn hàng (Sale History).
  - Chưa có Validation tìm kiếm theo `name`, `phone` trên FE.
  - Xoá khách hàng hiện tại đang là xoá cứng (hard-delete) mà chưa có khâu đối chiếu dữ liệu tồn tại bên collection `Sale`.
  - **Lỗi không thể tạo mới khách hàng bằng tài khoản Super Admin**: Hệ thống Backend bắt buộc phải truyền `branch` vào nếu tài khoản là Global Admin, tuy nhiên Form trên Frontend lại đang bỏ quên trường "Chọn chi nhánh" này, dẫn đến API trả về lỗi 400 Bad Request.

## Nâng cấp & Sửa lỗi (Đã bổ sung)

1. **Sửa lỗi Super Admin không tạo/sửa được khách hàng**: Thêm trường `branch` (chọn chi nhánh) vào giao diện `CustomerFormModal.tsx` trên Frontend. Trường này chỉ bắt buộc và hiển thị với tài khoản có quyền Quản trị toàn hệ thống (Super Admin).
2. **Sửa lỗi Response Messages**: Backend trả về lỗi chưa chuẩn (ví dụ "Vui lòng chỉ định người dùng" thay vì "Không tìm thấy khách hàng"). Cần chuẩn hóa các hằng số lỗi trong `constants/responseMessages.js`.
3. **Phòng ngừa Data Integrity Bug**: Hàm API xóa khách hàng (`BE/src/services/customer.service.js`) cần query sang bảng `Sale` để cản việc xóa khách hàng đẻ tránh mồ côi đơn hàng.

## Yêu cầu nghiệp vụ (đã chốt)

- **Về Permission**: Tạo bộ quyền truy cập độc lập `customers` thay vì mượn tạm của `suppliers`.
- **Trang Chi Tiết Khách Hàng**: Có thể click xem chi tiết 1 khách hàng. Giao diện chia 2 phần: Thông tin chung (Tên, liên hệ, công nợ...) và Tabs Lịch sử giao dịch (Danh sách các hoá đơn bán hàng từ trước tới nay).
- **Ràng buộc Xóa (Delete Constraints)**: Bắt buộc chặn xóa cứng (hard-delete) nếu khách hàng đã có hóa đơn (Sale transactions).
- **Bổ sung UI**: Thêm ô tìm kiếm dữ liệu Khách hàng theo `Tên` hoặc `SĐT`. Bổ sung trường `Email`, `Ghi chú` vào form thao tác.

## Thiết kế UX / Flow

### Flow 1: Danh sách và Tìm kiếm Khách hàng
- Xem danh sách hiển thị các thông tin: `Tên, SĐT, Email, Tổng nợ`
- Thêm nhanh/sửa thông qua Modal.
- Cung cấp ô Search Box: Gõ text tìm kiếm theo Tên / SĐT (Có debounce delay).

### Flow 2: Luồng kiểm soát xoá (Delete)
- Người dùng bấm "Xoá Khách hàng"
- Frontend gửi API delete request.
- Backend kiểm tra trong DB `Sale`. Nếu tồn tại hoá đơn gắn với `CustomerId` -> Trả về HTTP 400 cùng message báo không thể xoá.
- Frontend nhận lỗi và bắn Toast Warning.

### Flow 3: Trang Chi tiết khách hàng
- User bấm "Nháy đúp" (Double click) vào row trên Table hoặc nút "Chi tiết" ở Tuỳ chọn.
- Điều hướng sang `/customer/:id`.
- Fetch `customer profile` hiển thị Header: Tổng nợ bao nhiêu, Địa chỉ, Số điện thoại.
- Tab chính hiển thị danh sách đơn bán hàng liên quan. (Gọi API `/sales` kèm filter `customer=customerId`).

## Thiết kế Data Model

### Tương thích & Migration

- Không cần tạo schema mới, giữ nguyên `Customer` schema và `Sale` schema đã có.
- Bổ sung data seed vào collection `Permission`: module `customers`.

## Các thay đổi dự kiến trong code

### Backend
- `{BE/src/services/customer.service.js}`: Cập nhật hàm `deleteCustomerById`, thêm bước check `Sale.countDocuments({ customer: customerId })`. Nếu count > 0 thì throw Error rào cản. Thêm logic support populate `branch` để trả về đúng cấu trúc. Sửa lại các responseMessage về cho chuẩn.
- `{BE/src/constants/responseMessages.js}`: Bổ sung các cụm từ lỗi chuẩn riêng cho mục `customer`.
- `{BE/src/docs/...}`: Cập nhật tài liệu API nếu có.

### Frontend
- `{ware-house-fe/src/types/auth.ts}`: Bổ sung `customers` array vào `permissionType`.
- `{ware-house-fe/src/api/customer.ts}`: Cập nhật interface `Customer` bổ sung field `email`, `note`.
- `{ware-house-fe/src/layouts/menus/menu.tsx}`: Chỉnh sửa ROUTE_PERMISSIONS đổi quyền thành `customers`.
- `{ware-house-fe/src/pages/app/customers/index.tsx}`: 
  - Update `usePermission('customers')`.
  - Thêm Input `Search` và đẩy param `name` / `phone` xuống API fetch list.
  - Sửa action update/view trong bảng để redirect sang trang chi tiết (hoặc Mở Modal tuỳ action).
- `{ware-house-fe/src/pages/app/customers/components/create-update-customer.tsx}`: 
  - Thêm field `Email` và Textarea `Ghi chú`.
  - Bổ sung Select Box chọn "Chi Nhánh" với danh sách lấy từ store/API. Chỉ được hiển thị nếu phân quyền `isGlobalAdmin` (Tức Super Admin sử dụng). Map branchId payload vào Create/Update API call.
- `[NEW] {ware-house-fe/src/pages/app/customers/detail.tsx}`: Layout trang chi tiết với thông tin tổng quan và bảng danh sách Lịch sử mua hàng.
- `{ware-house-fe/src/router/routers.tsx}` và `routes.ts`: Bổ sung dynamic route `/customer/:id`.

## Rủi ro / Edge cases

- **Bảo toàn công nợ**: Có thể phát sinh bất đồng bộ công nợ nếu một hóa đơn bị xóa / hoàn tác ở nơi khác. Xử lý: Module Sale đã bao gồm cơ chế thay đổi totalDebt ở Customer nên đã an toàn ở mảng này.
- **Migration quyền**: Những Role có sẵn (Giám đốc, Nhân viên kho) trước chưa có quyền `customers` -> Nên báo user cấp quyền này sau khi code lên hoặc viết seed/script gán thẳng cho Role Admin.

## Test plan

### Happy paths

- **Tạo KH mới**: Điền đầy đủ thông tin Tên, SĐT, Email, Note. Bấm lưu nhận Toast success, xuất hiện trên dòng đầu danh sách (dữ liệu sort newest).
- **Search KH**: Gõ tên => Table refresh và tìm ra chính xác dữ liệu mong muốn.
- **Xem Lịch sử giao dịch**: Click vào KH đã mua hàng, thấy được list Đơn bán hàng, Check tổng nợ là hợp lệ.

### Edge cases

- Xoá khách hàng **CHƯA CÓ** hóa đơn bán: Success.
- Xoá khách hàng **ĐÃ CÓ** hóa đơn bán: Trả về Toast cảnh báo đỏ "Khách hàng đã phát sinh giao dịch, không thể xoá!".

## Những điểm dễ thay đổi trong tương lai

- Cấu trúc thanh toán và cấn trừ công nợ sẽ phức tạp hơn. (hiện tại tính gộp totalDebt). Do đó, có khả năng module Customers sẽ cần kết nối chặt chẽ thêm module `Payments` sắp tới.
