# PLAN: Nâng cấp Phân hệ Bán Hàng (Sales Module)

## Mục tiêu
- Vá lỗ hổng kỹ thuật làm thất thoát kho (lỗi vòng lặp đứt gãy không bọc Transaction Base).
- Đồng bộ hóa logic Tiền Thuế (Tax) và Chiết khấu (Discount) bị mất kết nối giữa FE và BE.
- Khắc phục lỗi ném parameter rỗng `warehouse: ''` từ FE lên API.

## Non-goals (Chưa làm ở phase này)
- Chưa báo cáo Doanh thu dạng Biểu đồ tổng hợp đa chiều.
- Chưa làm Luồng Trả hàng/Nhập lại kho (Refund). Tránh nhồi nhét quá nhiều vào 1 Plan gây over-engineer.

## Bối cảnh hiện trạng
- File API: `BE/src/controllers/sale.controller.js` và `sale.service.js`
- File UI: `ware-house-fe/src/pages/app/sales/product_invoice_list.tsx`
- **Tình trạng (Health):** Red 🔴 (Tính năng đang tiềm ẩn các Bug lớn làm sai số tiền bạc và thất thoát vật tư Kho hàng).

## 📋 Cần confirm một số điểm (Open Questions)

> [!WARNING]
> Vui lòng confirm các Option dưới đây (có thể nhắn ngắn gọn: "A chọn Opt 1 cho câu 1, Opt 2 cho câu 2..."):

### 1. Quản lý Khách Hàng (Customer) & Công Nợ
**Ngữ cảnh:** Hiện tại giỏ hàng UI bắt nhập "Tên khách hàng" dưới dạng text gõ tay, và nếu gõ xong tạo Đơn bán thì BE lưu nó thành chuỗi ký tự String, không có thông tin Số điện thoại hay lưu vết nợ nần nếu khách trả thiếu (Ví dụ bill 100k trả 80k).
**Câu hỏi:** Anh có muốn xây dựng chức năng quản lý khách hàng theo dạng Bảng Chuẩn (Customer Table) không?
**Đề xuất:** 
- **Option 1A:** Có. Thêm model `Customer` (Tên, SĐT, Dư nợ/Công nợ). Khi tạo hóa đơn, nếu khách thanh toán không đủ sẽ tự động rớt dư nợ vào profile khác. Phải làm 1 menu quản lý Khách Hàng.
- **Option 2A:** Không cần. Tạm thời cứ gõ tên bằng Text cho nhanh, ưu tiên vá 3 lỗi trầm trọng kỹ thuật sửa/xóa trước để app chạy trơn tru đã. Khách hàng, công nợ update phiên bản sau.

### 2. Nút "Lưu Tạm" Dùng Làm Gì?
**Ngữ cảnh:** Nút "Lưu Tạm" màu vàng ở giao diện Bán hàng FE mình đọc source code chỉ thấy ghi hàm `setItems([])` -> Nó đang hoạt động giống nút "Hủy và Xóa Sạch Giỏ Hàng" chứ chả lưu gì cả.
**Câu hỏi:** Ý đồ nghiệp vụ của anh lúc vẽ nút này là gì?
**Đề xuất:** 
- **Option 1B:** Đổi thành "Lưu Nháp" -> Sẽ call API lưu vào DB 1 đơn hàng trạng thái `DRAFT` (Giữ đó cho ngày mai bán tiếp và đặc biệt là không trừ tồn kho).
- **Option 2B:** Code FE của nút này đang sai nghiệp vụ, đổi tên nó thành "Hủy Giỏ Hàng" cho đúng thao tác `setItems([])`.

### 3. Chọn "Kho Bãi" Khi Bán Hàng
**Ngữ cảnh:** Khi click vào nút Tính Tiền (Checkout), FE gọi API `createInvoiceApi` gửi biến cứng `warehouse: ''`. Điều này 100% làm server báo lỗi vì Backend yêu cầu 1 giá trị id của Kho cụ thể.
**Câu hỏi:** Lấy ID kho bãi xuất hàng từ đâu?
**Đề xuất:** 
- **Option 1C:** Thêm 1 combo-box trên cùng bên trái của màn hình Bán Hàng yêu cầu user "Chọn Kho Xuất: Chi nhánh HN - Kho Tổng / Chi nhánh HN - Kho Phụ". 
- **Option 2C:** Nếu 1 Chi nhánh chỉ cài đặt cứng có duy nhất 1 Kho, Backend tự động query lấy kho đầu tiên của Chi nhánh user đó áp vô.

---

## Thiết kế Kỹ thuật / Kiến trúc Kế tiếp (Dự kiến)
1. **BE Engine:** Sẽ bọc toàn bộ khối `createSale` bằng `const session = await mongoose.startSession(); session.withTransaction()`. Nếu trừ kho thất bại 1 món, hệ thống nhả lại toàn bộ hàng cho Kho.
2. **Tiền Nong:** Backend sẽ mở Schema `taxMoney` và `discountMoney` cho FE push ngược lên thay vì Backend tự reset về số `0` lúc khởi tạo.
3. **Audit Trails (Sửa/Xoá Lịch Sử):** Đóng đinh/Sửa lỗi phần Hàm Delete Sale. Khi nhấn "Xoá hoá đơn", BE phải tự mò vào model Batch để cộng (+ hồi lại) hàng và báo huỷ Ticket `InventoryTransaction`.
