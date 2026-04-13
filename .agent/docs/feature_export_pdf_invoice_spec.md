# Tài liệu Đặc tả (PRD) - Xem & Xuất Hóa đơn PDF (Khổ A4)

## 1. Tóm tắt (Summary)
Tính năng cho phép người dùng (Nhân viên, Quản lý, Admin) xem trước (Preview) hóa đơn bán hàng theo định dạng thiết kế khổ giấy A4 và xuất (Tải xuống) tệp dưới dạng PDF phục vụ cho mục đích lưu trữ hoặc in ấn nội bộ. Giải pháp được chọn là render PDF tại phía Frontend (sử dụng thư viện capture HTML) để tối ưu hóa hiệu năng Server.

## 2. Actor & Use Cases
- **Actor:** Bất kỳ Role nào có quyền `View Invoices` (Xem danh sách hóa đơn).
- **Use Case 1 (Xem trước):** Bấm nút 🔍 ở dòng hóa đơn, Modal chứa giao diện tờ hóa đơn A4 hiện lên.
- **Use Case 2 (Tải PDF):** Bấm nút 📥 ở dòng hóa đơn hoặc trong Modal Preview, trình duyệt thực hiện sinh file PDF và tự động Download.

## 3. Flow Diagram (Sơ đồ luồng)

```text
┌─────────────────────────────────┐
│  Màn hình Danh sách Hóa đơn     │
│  (Mỗi dòng có 2 nút hành động)  │
└────────────────┬────────────────┘
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
┌───────────┐         ┌───────────┐
│ Nút [🔍]  │         │ Nút [📥]  │
│ Xem trước │         │ Tải PDF   │
└─────┬─────┘         └─────┬─────┘
      │                     │
┌─────▼─────┐         ┌─────▼─────┐
│ Fetch Data│         │ Fetch Data│
│ Chi tiết  │         │ Chi tiết  │
│ Hóa đơn   │         │ Hóa đơn   │
└─────┬─────┘         └─────┬─────┘
      │                     │
┌─────▼─────┐         ┌─────▼─────┐
│ Mở Modal  │         │ Render ngầm
│ Preview UI│         │ dạng PDF &│
│ (Khổ A4)  │         │ Tự động tải
└───────────┘         └───────────┘
```

## 4. Business Rules & Validations (Quy tắc nghiệp vụ)
1. **Fetch dữ liệu đầy đủ:** Cần join (populate) để lấy đủ thông tin Branch (Chi nhánh), Customer (Khách hàng), User (Nhân viên), và Mảng Invoice.items.
2. **Layout A4 Fix cứng:** Giao diện Preview sử dụng tỷ lệ cứng 210x297 (mm). Nó sẽ scale CSS để vừa vặn với kích thước màn hình đang xem.
3. **QR Code:** Trong template A4 cần có phần tử tạo QR Code (chứa text đơn giản thông tin tóm tắt Hóa đơn).
4. **Tên File Download:** `HoaDon_[Mã-Hóa-Đơn].pdf` (Ví dụ: `HoaDon_IV-2024-001.pdf`).
5. **Ủy quyền (Authz):** Chỉ cần quyền xem (View Invoices) là có thể xem và tải. 

## 5. Edge Cases & Rủi ro
- **Tên SP quá dài:** `word-wrap: break-word` hoặc cắt `text-overflow` để không vỡ bảng.
- **Header trống khi thiếu Logo Nhánh:** Hiển thị Tên nhánh ở dạng Text chữ lớn (Fallback).
- **Tràn 2 trang (Page-break):** Config CSS thuộc tính ngắt trang (`page-break-inside: avoid;` cho thẻ `<tr>`) để các dòng trong bảng sản phẩm không bị cắt làm đôi ngang thân.
- **Spam nút Tải (Treo máy):** Có Spinner / Loading state và Disabled liên kết tải trong thời gian tạo PDF Blob.
- **Hóa đơn Hủy:** Render watermark chữ ("ĐÃ HỦY - CANCELLED") chéo giữa giấy đối với các hóa đơn có trạng thái đã bị hủy bỏ để tránh bị lạm dụng.

## 6. Acceptance Criteria (Tiêu chí nghiệm thu)

**Scenario 1: Xem Preview hóa đơn hợp lệ**
- **Given** người dùng ở màn hình Danh sách hóa đơn.
- **And** hóa đơn `IV-001` có trạng thái HOÀN THÀNH.
- **When** bấm nút **Xem trước (🔍)** ở dòng `IV-001`.
- **Then** modal Preview xuất hiện, hiển thị template A4 với đầy đủ logo, mã HĐ, tên KH, dsản phẩm, tổng tiền. Không thấy Watermark "ĐÃ HỦY".

**Scenario 2: Tải hóa đơn PDF**
- **Given** người dùng đang mở Modal Preview của `IV-001`.
- **When** bấm nút **Tải xuống**.
- **Then** Nút bấm hiển thị trạng thái "Đang xử lý...", sau đó trình duyệt tự động tải xuống file `HoaDon_IV-001.pdf`.
- **And** file xem được bằng trình duyệt/Adobe Reader, chất lượng rõ nét, không bị vỡ layout, table bị cắt ngang.

**Scenario 3: Ngăn ngừa sử dụng hóa đơn Hủy (Cancelled)**
- **Given** hóa đơn `IV-002` có trạng thái ĐÃ HỦY.
- **When** bấm Xem trước hoặc Tải PDF.
- **Then** file/bản preview hiển thị ký hiệu watermark đỏ "ĐÃ HỦY" lớn ở giữa trang.
