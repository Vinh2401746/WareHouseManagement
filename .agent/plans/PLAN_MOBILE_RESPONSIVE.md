# PLAN: Fix Mobile Responsive

## Mục tiêu

- Khắc phục lỗi giao diện Header bị tràn ngang (Overflow) trên màn hình độ phân giải dưới 768px.
- Xử lý lỗi các giao diện chức năng sử dụng chế độ chia cột (Splitter/Col) như "Tạo đơn bán hàng" và "Nhập/Xuất kho" bị bóp hẹp đến mức biến dạng trên màn hình Mobile.

## Non-goals (chưa làm ở phase này)

- Chưa thực hiện viết lại hoặc đập đi xây lại toàn bộ cấu trúc UI Layout nếu không thật sự cần thiết.
- Chưa bổ sung tính năng in hoá đơn hay backend. Focus hoàn toàn vào UI trên thiết bị nhỏ.

## Bối cảnh hiện trạng

- Ứng dụng về tổng thể trên Desktop đang rất đẹp. Bảng (TableCommon) đã được fix responsive theo chiều ngang thành công.
- Tuy nhiên, component `header.tsx` đang có Logo rộng 280px + Khung tìm kiếm 300px + Avatar, trên không gian thiết bị Mobile (375px) làm giao diện bị tràn.
- Trang `sales/create_invoice.tsx` dùng `Splitter` (Antd v6) làm giỏ hàng luôn bám vào một bên màn hình, kể cả khi dùng Smartphone.
- Trang `warehouse_import_export/detail/index.tsx` đang để hardcode `Col span={12}` làm các trường lúc nào cũng hiển thị song song ngay cả khi màn hình chật chội.

## ✅ Yêu cầu nghiệp vụ

- **Yêu cầu 1**: Giao diện Header khi thu nhỏ dưới size MD (< 768px) phải tự động ẩn đi hoặc thay đổi linh hoạt các mục cồng kềnh (logo lớn, ô input) để vừa vặn với kích thước trên điện thoại, đồng thời không che chắn nút Menu bấm Sidebar.
- **Yêu cầu 2**: Giao diện Tạo Đơn Bán Hàng khi về mobile phải cho phép người dùng thao tác xếp dọc (Giỏ hàng trượt xuống dưới hoặc chọn SP hiện dưới giỏ hàng), thay vì chia đôi màn hình vô nghĩa.

## Thiết kế UX / Flow

### Cải thiện App Header
- Đoạn mã sử dụng `Grid.useBreakpoint` từ Antd để xác định xem đang ở giao diện Mobile (`screens.md === false`).
- Trên Mobile: 
  - Logo được ẩn hoặc thu nhỏ kích thước chữ.
  - Ô thanh tìm kiếm (Input) sẽ không hiển thị trên topbar để tránh dư thừa (chiếm sóng).
  - Vùng chứa chức năng Profile + Noti xếp gọn sang phải.

### Cải thiện Trang Tạo Đơn (Create Invoice / Splitter)
- Chuyển layout logic: Nếu `screens.md` = false, truyền prop `layout="vertical"` vào component `<Splitter>` để tự động tách Khung Sản Phẩm và Khung Tính Tiền từ dọc rớt thành ngang.

### Cải thiện Form Import Kho
- Thay vì `<Col span={12}>`, sử dụng component breakpoint `<Col xs={24} md={12}>` -> Điện thoại sẽ 1 dòng (24), PC/Laptop sẽ 1 nửa dòng (12).

## Các thay đổi dự kiến trong code

- `ware-house-fe/src/layouts/header.tsx`: Bổ sung điều kiện ẩn/hiện Logo và thanh Searchbar dựa theo `useBreakpoint()`.
- `ware-house-fe/src/pages/app/sales/create_invoice.tsx`: Thay đổi thuộc tính layout của `<Splitter>` tuỳ thuộc theo kích thước breakpoint và chỉnh size form bên trong `<Col xs={24} sm={24} md={8} xl={6}>`.
- `ware-house-fe/src/pages/app/warehouse_import_export/detail/index.tsx`: Tìm và replace hàng loạt `span={12}` hoặc `span={8}` sang dạng Responsive Grids `xs={24} sm={24} md={12}`.
- Có thể thêm một vài rule overflow trong `header.css` nếu cần thiết (`overflow-x: hidden`).

## Rủi ro / Edge cases

- **Bị che khuất nút Toggle Sidebar**: Khi set lại align Header trên mobile, cần kiểm tra chắc chắn Nút "FastBackward (Menu Hamburger)" vẫn nằm ở vị trí dễ bấm được.

## Những điểm cần quyết định & Xác nhận từ cậu

⚠️ **Mình cần cậu xác nhận các chi tiết sau trước khi tiến hành code:**

1. Ở khung Header trên Mobile, mình **định ẩn hẳn** thanh Input Tìm kiếm đi (vì cũng ít xài ở không gian chật) và chỉ giữ lại Avatar + Chuông + Menu Toggle. Cậu thấy hợp lý chứ?
2. Trong trang **Tạo đơn bán hàng**, thay vì chia cột ngang, mình sẽ cho Splitter xếp dọc (layout vertical). Ngược lại trên PC vẫn giữ nguyên như cũ. OK không?

*(Nếu cậu chốt, hãy hồi đáp để tớ chuyển sang Workflow Cập Nhật Code luôn nhé!)*
