# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ KHO (WMS) DÀNH CHO NGƯỜI DÙNG CUỐI

*Tài liệu này được soạn thảo chi tiết dành cho End-User (Nhân viên kho, Kế toán, Quản lý) với các tình huống sử dụng thực tế (Use-Cases).* 

---

## MỤC LỤC
1. [Giới Thiệu Chung](#1-gioi-thieu-chung)
2. [Đăng Nhập & Phân Quyền Cơ Bản](#2-dang-nhap--phan-quyen-co-ban)
3. [Quy Trình Quản Lý Kho Dữ Liệu Nền Tảng](#3-quy-trinh-quan-ly-kho-du-lieu-nen-tang)
4. [Tình Huống: Nhập Hàng Vào Kho (Inbound)](#4-tinh-huong-nhap-hang-vao-kho-inbound)
5. [Tình Huống: Xuất Hàng Ra Khỏi Kho (Outbound)](#5-tinh-huong-xuat-hang-ra-khoi-kho-outbound)
6. [Tình Huống: Bán Hàng & Xuất Hóa Đơn (Sales)](#6-tinh-huong-ban-hang--xuat-hoa-don-sales)
7. [Đọc Báo Cáo & Xử Lý Cảnh Báo](#7-doc-bao-cao--xu-ly-canh-bao)

---

## 1. GIỚI THIỆU CHUNG
Hệ thống Quản lý Kho (WMS) giúp bạn số hóa toàn bộ quá trình luân chuyển hàng hóa. Mỗi người dùng sẽ được cấp một tài khoản gắn liền với một **Chi nhánh** (Branch). Mọi dữ liệu bạn nhìn thấy (Sản phẩm, Số lượng tồn, Phiếu xuất nhập) đều được giới hạn trong chi nhánh của bạn nhằm đảm bảo tính bảo mật và độc lập dữ liệu.

---

## 2. ĐĂNG NHẬP & PHÂN QUYỀN CƠ BẢN

### 2.1. Đăng nhập hệ thống
- **Tình huống (Case) 1: Đăng nhập thành công.** 
  - Bước 1: Vào trang chủ.
  - Bước 2: Nhập Email và mật khẩu. 
  - Bước 3: Hệ thống tải dữ liệu về máy và chuyển hướng bạn đến bảng **Tổng quan (Dashboard)**.
- **Tình huống (Case) 2: Quên mật khẩu.**
  - Hãy liên hệ với Quản trị viên (Super Admin) của hệ thống. Họ sẽ vào mục quản lý nhân sự để cấp lại cho bạn mật khẩu mới.

### 2.2. Trải nghiệm Phân quyền (RBAC)
- **Tình huống:** Kế toán và Thủ khoa cùng đăng nhập nhưng thấy giao diện khác nhau.
  - *Giải thích:* Hệ thống sẽ tự ẩn các nút "Thêm mới", "Chỉnh sửa", "Xóa" nếu bạn không có quyền. Nếu bạn thấy màn hình của mình thiếu đi tính năng tạo phiếu nhập/xuất, tức là Quản lý chưa cấp quyền tương ứng cho tài khoản của bạn.

---

## 3. QUY TRÌNH QUẢN LÝ KHO DỮ LIỆU NỀN TẢNG

Trước khi có thể Nhập/Xuất kho hàng, dữ liệu nền tảng phải được chuẩn bị đầy đủ. Dưới đây là thứ tự thiết lập:

### 3.1. Thiết lập Đơn vị & Danh mục ngành hàng
- **Tại sao cần thiết lập?** Máy móc không hiểu "Bia" đong bằng "Thùng" hay "Lon". Bạn cần khai báo.
- **Thao tác:** 
  1. Vào **Sản phẩm > Đơn vị**. Thêm mới: "*Thùng*", "*Cái*", "*Chiếc*".
  2. Vào **Sản phẩm > Danh mục**. Thêm mới: "*Đồ Uống*", "*Thực Phẩm*".
- **Tình huống lỗi thường gặp:** Không thể xóa Đơn vị "Thùng".
  - *Nguyên nhân:* Hệ thống bảo vệ dữ liệu. Đơn vị "Thùng" đang được gắn cho 1 Sản phẩm khác. Bạn phải đổi đơn vị của sản phẩm đó trước khi xóa.

### 3.2. Quản lý Sản Phẩm (Products)
- **Thao tác:** Nhấn thêm Sản phẩm mới, điền Mã SKU (VD: `BIA-TGL-330`).
- **Kịch bản thực tế:** Hệ thống cảnh báo Mã SKU đã tồn tại.
  - *Cách xử lý:* Mã SKU bắt buộc là DUY NHẤT. Hãy thêm hậu tố cho SKU, ví dụ `BIA-TGL-330-CN1`.

### 3.3. Các đối tác: Nhà cung cấp & Khách hàng
- Không thể lưu đơn hàng nếu chưa biết nhập của ai hay bán cho ai. Bạn vào **Đối tác** để lập danh bạ (Tên, Số ĐT, Địa chỉ).

---

## 4. TÌNH HUỐNG: NHẬP HÀNG VÀO KHO (INBOUND)
*Đây là công việc hàng ngày của Thủ kho.*

### Kịch bản chuẩn: Nhập hàng mới nguyên đai linh kiện
1. Xe hàng tới kho. Bạn vào mục **Giao dịch kho > Nhập xuất kho**, nhấn **Tạo phiếu nhập**.
2. **Chọn Nhà cung cấp**, **Chọn Kho lưu trữ**.
3. Tại bảng sản phẩm bên dưới: Bấm thêm sản phẩm.
4. **CHÚ Ý QUAN TRỌNG VỀ LÔ HÀNG (BATCH):** 
   - Hàng mới hoàn toàn: Bạn nhấn vào ô "Lô hàng", chọn **Tạo Lô mới**. Điền **Tên Lô** (VD: *Lô Tháng 10*), ngày sản xuất, hạn sử dụng.
   - Hàng nhập thêm cho lô đã có: Chỉ việc chọn tên lô cũ từ danh sách, chọn sản phẩm.
5. Kiểm tra Số lượng, Giá nhập. Hệ thống sẽ tự nhân lên Thành tiền.
6. Nhấn Lưu phiếu.
7. **Kết quả kỳ vọng:** Bạn vào **Sản phẩm > Quản lý Lô**, sẽ thấy số lượng tồn kho của "Lô Tháng 10" tự động tăng đúng với số lượng trên phiếu.

---

## 5. TÌNH HUỐNG: XUẤT HÀNG RA KHỎI KHO (OUTBOUND)
*Thao tác giảm hàng thực tế do lỗi rách bao bì, xuất cho nhân viên khác chi nhánh, xuất nội bộ.*

### Kịch bản chuẩn: Xuất hàng
1. Vào **Giao dịch kho > Nhập xuất kho**, chọn **Tạo phiếu xuất**.
2. Chọn sản phẩm.
3. **CHÚ Ý:** Lúc này, bạn chỉ chọn được những **Lô hàng đang có Tồn Kho lớn hơn 0**. 
4. Nhập Số lượng xuất.
- **Tình huống lỗi - Số lượng vượt mức:** Bạn nhập số lượng là `100`, nhưng lô hàng chỉ còn `80`.
  - *Cách xử lý:* Hệ thống sẽ chặn bạn tiến hành thao tác này (Báo lỗi Validation). Bạn cần phải xuất: 80 từ Lô 1, và thêm 1 dòng nữa xuất 20 từ Lô 2.

---

## 6. TÌNH HUỐNG: BÁN HÀNG & XUẤT HÓA ĐƠN (SALES)
*Dành cho quản lý kinh doanh, ghi nhận doanh thu thực.*

### Kịch bản chuẩn: Lên đơn bán cho đối tác
1. Menu **Kinh doanh > Hóa đơn bán hàng**. Chọn **Thêm mới**.
2. Chọn **Khách hàng** từ danh bạ lưu sẵn.
3. Thêm các sản phẩm muốn bán. Điền số lượng. 
4. Giá bán sẽ tự động lấy mặc định lúc bạn cài đặt sản phẩm, nhưng bạn **CÓ THỂ sửa lại** ngay trên hóa đơn (Hỗ trợ khi có chiết khấu, mặc cả).
5. Trạng thái Đơn hàng:
   - Nếu để trạng thái **"Draft" (Nháp)**: Hóa đơn được lưu nhưng số lượng Tồn kho **CHƯA** bị giảm. Bạn thoải mái bấm vào dòng hóa đơn để sửa số lượng, đổi món.
   - Nếu chuyển đổi trạng thái (Hoàn thành): Hóa đơn sẽ bị khóa vĩnh viễn (Read-only), đóng băng dữ liệu, đồng thời Hệ thống sẽ tự tìm và "Trừ" tồn kho của sản phẩm tương ứng trong các Lô hàng.

### Kịch bản lỗi:
- Nhấn hoàn thành nhưng báo **"Không đủ tồn kho"**: 
  - *Xử lý:* Tức là thủ kho chưa làm "Phiếu nhập hàng" ở Bước 4, khiến số lượng trên hệ thống bị rỗng. Cần nhắc thủ kho nhập hàng vào phần mềm trước khi kinh doanh xuất hóa đơn.

---

## 7. ĐỌC BÁO CÁO & XỬ LÝ CẢNH BÁO
Khu vực Dashboard (Tổng quan) hoạt động như một Trợ lý ảo cho người dùng.

### 7.1. Cảnh báo hàng sắp hết hạn
- Tại góc phải của màn hình Tổng quan, sẽ có danh sách lô hàng đổi màu **Cam** hoặc **Đỏ**:
  - Dữ liệu hiển thị dựa trên Hạn sử dụng (Expiry Date) mà bạn đã khai báo khi Tạo Lô Hàng.
  - *Action (Hành động):* Lập tức chuyển sản phẩm sang khu vực khuyến mãi đẩy sale nội bộ, hoặc thanh lý.

### 7.2. Cảnh báo hết hàng (Out of stock)
- Hệ thống theo dõi những sản phẩm có Tổng số lượng trong toàn bộ các lô = 0.
- *Action (Hành động):* Báo nhà cung cấp gọi hàng mới nhập vào kho.

---
**📍 Thông điệp từ bộ phận kỹ thuật:** Mọi thao tác XÓA phiếu, XÓA giao dịch đều nên được hạn chế tối đa để duy trì tính toàn vẹn và dễ truy vết đối soát kế toán. Trong trường hợp nhập nhầm số, hãy dùng nghiệp vụ Đảo (Tạo 1 Phiếu xuất đền bù cho Phiếu nhập bị sai) thay vì xóa trắng lịch sử.
