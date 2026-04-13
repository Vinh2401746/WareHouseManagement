# 📖 Hướng Dẫn Sử Dụng (User Manual) - Hệ Thống Quản Lý Kho (WMS)

Tài liệu này cung cấp hướng dẫn thao tác chi tiết từng bước cho người sử dụng Hệ thống Quản lý Kho (Warehouse Management System - WMS). Hệ thống giúp quản lý từ việc phân quyền, nhập hàng, quản lý hàng hóa theo lô, đến bán hàng và theo dõi báo cáo.

---

## 1. 🔑 Đăng Nhập & Đăng Xuất

### Đăng nhập
1. Truy cập vào đường dẫn trang web của hệ thống.
2. Nhập **Email** và **Mật khẩu** do quản trị viên cung cấp.
3. Nhấn nút **Đăng nhập**. Hệ thống sẽ nhận diện tài khoản và tự động giới hạn phân quyền cũng như chi nhánh làm việc tương ứng với tài khoản của bạn.

### Đăng xuất
1. Nhấn vào biểu tượng thông tin cá nhân (Avatar) ở góc trên bên phải màn hình.
2. Chọn **Đăng xuất**.

---

## 2. 🛡️ Quản Lý Quyền & Người Dùng (Dành cho Admin)

### 2.1 Quản lý Vai trò (Roles) & Phân quyền
1. Vào **Cài đặt hệ thống > Danh sách vai trò**.
2. Tại đây, bạn có thể **Thêm mới** một vai trò (vd: Nhân viên kho, Kế toán, Quản lý chi nhánh).
3. Đánh dấu tick vào các quyền (Permissions) cụ thể (vd: Create Product, View Sale Invoice, v.v.).
4. Nhấn **Lưu**.

### 2.2 Quản lý Nhân sự (Users)
1. Vào mục **Quản lý Hệ Thống > Danh sách nhân viên**.
2. Để thêm nhân sự, nhấn **Thêm nhân sự mới**.
3. Điền các thông tin: Tên, Email, Mật khẩu, Chọn Chi nhánh trực thuộc và Chọn Vai trò (Role).
4. Nhấn **Xác nhận**. Nhân sự mới sẽ bị giới hạn để chỉ thấy dữ liệu thuộc nhánh và quyền mà bạn đã gắn.

---

## 3. 🏢 Quản Lý Chi Nhánh & Kho & Đối Tác

### 3.1 Quản lý Chi nhánh (Branches)
1. Vào **Danh mục > Quản lý Chi nhánh**.
2. Thêm mới chi nhánh, ghi rõ địa chỉ và số điện thoại liên hệ. Hệ thống sẽ cấp phát dữ liệu riêng biệt cho chi nhánh này.

### 3.2 Quản lý Kho (Warehouses)
1. Trong một chi nhánh, có thể tạo nhiều Kho hàng nhỏ.
2. Vào **Danh mục > Quản lý Kho**. Nhấn **Tạo kho mới**, chọn chi nhánh đang trực thuộc và lưu lại.

### 3.3 Khách Hàng (Customers) & Nhà Cung Cấp (Suppliers)
- **Nhà cung cấp:** Vào **Đối tác > Nhà cung cấp**. Nơi lưu trữ thông tin đối tác cung cấp hàng hoá để dùng khi lập phiếu nhập kho.
- **Khách hàng:** Vào **Đối tác > Khách hàng**. Dùng để lưu thông tin người sẽ mua hàng khi lập thẻ bán hàng.

---

## 4. 📦 Quản Lý Cấu Hình & Sản Phẩm

### 4.1 Quản lý Đơn vị tính (Units) & Danh mục (Categories)
- Vào mục **Sản phẩm > Đơn vị tính** hoặc **Danh mục**. 
- Đây là bước cơ bản đầu tiên: Khởi tạo các nhóm mặt hàng (Ví dụ: Đồ uống, Đồ hộp) và đơn vị (Cái, Lốc, Thùng).

### 4.2 Thêm Sản Phẩm (Products)
1. Vào mục **Sản phẩm > Danh sách sản phẩm**.
2. Nhấn **Thêm mới**.
3. Điền Tên sản phẩm, Mã SKU, Đơn vị tính, Giá nhập định mức, Giá bán.
4. Tải lên hình ảnh sản phẩm (nếu có).

### 4.3 Quản lý Lô hàng (Batches)
- Sản phẩm khi nhập về kho sẽ tự động sinh ra hoặc gắn vào một **Lô hàng**.
- Để kiểm tra lô hàng, HSD, lô nào đang hết hoặc còn bao nhiêu: Vào mục **Sản phẩm > Quản lý Lô**.

---

## 5. 🔄 Quản Lý Giao Dịch Kho (Nhập / Xuất Kho)

Là tính năng cốt lõi của thủ kho để lên phiếu hàng hóa:

### 5.1 Tạo Phiếu Nhập Kho (Import)
1. Vào **Giao dịch kho > Nhập / Xuất kho**.
2. Chọn **Tạo phiếu nhập**.
3. Nhập mã phiếu, **Chọn Nhà Cung Cấp**, **Chọn Kho** sẽ chứa hàng.
4. Thêm sản phẩm cần nhập vào lưới thông tin. Nhập **Số lượng**, **Giá nhập**, và **Chọn Lô hàng** / hoặc **Tạo mới Lô hàng (kèm Ngày sản xuất, Hạn sử dụng)**.
5. Sau khi cập nhật, kho hàng sẽ tự động tăng số lượng tồn.

### 5.2 Tạo Phiếu Xuất Kho (Export)
- Thực hiện tương tự Phiếu nhập, nhưng kho sẽ tự động khấu trừ số lượng sản phẩm.
- Khi xuất hàng cần xuất đúng Lô hàng tồn để đảm bảo quy trình.

---

## 6. 🛒 Bán Hàng (Sales Invoices)

Dành cho bộ phận Bán Hàng / Kế Toán để ra hoá đơn thương mại.

1. Vào mục **Kinh doanh > Hóa đơn bán hàng**.
2. Nhấn **Thêm hóa đơn mới**.
3. Chọn **Khách hàng** giao dịch.
4. Chọn danh sách **Sản phẩm** khách mua và nhập **Số lượng**. Hệ thống sẽ tự động tổng hợp số tiền cần thanh toán dựa trên giá bán sản phẩm.
5. Nhấn **Xác nhận hoàn thành**. Lượng hàng xuất bán sẽ được đồng bộ và giảm tồn kho theo hệ thống.

---

## 7. 📊 Báo Cáo & Thống Kê (Dashboard)

- Sau khi đăng nhập, màn hình mặc định là **Tổng Quan (Dashboard)**.
- **Tiện ích:**
  - Theo dõi nhanh tổng Doanh thu trong ngày/tháng.
  - Xem số lượng phiếu nhập / xuất đang được tạo.
  - Cảnh báo: **Sản phẩm sắp hết hạn** hoặc **Sản phẩm hết hàng (Tồn kho = 0)** để có kế hoạch nhập thêm.
  - Có thể lọc theo thời gian hoặc theo chi nhánh (đối với Admin).

---

> 💡 **Tip:** Trong quá trình làm việc, hãy luôn kiểm tra kỹ những **Lô hàng (Batches)** khi nhập/xuất để hệ thống báo cáo (Dashboard) hoạt động đúng chức năng khi cảnh báo hạn sử dụng nhé.

> ⚠️ **Lưu ý:** Việc xoá các giao dịch hay sản phẩm có thể ảnh hưởng đến lịch sử đối soát số liệu. Ưu tiên tạo thao tác đảo (VD: Nhập bù hoặc Xuất giảm) thay vì xóa trực tiếp để đảm bảo tính minh bạch.
