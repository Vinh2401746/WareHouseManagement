# Đặc tả Nghiệp vụ (BRD): Tính năng Dashboard (Trang chủ)

## 1. Tóm tắt
Màn hình Dashboard đóng vai trò là trung tâm kiểm soát (Overview) của Hệ thống Quản lý Kho, tập trung hiển thị các số liệu **Xuất - Nhập - Tồn** thay vì Doanh số. Dữ liệu trên Dashboard hiển thị linh động theo **Phân quyền (Role-based)** và hỗ trợ các **Bộ lọc (Filters)** theo không gian (Chi nhánh) và thời gian thực.

## 2. Actor & Use Cases
* **Super Admin / Admin:** 
  * Được phép xem dữ liệu tổng của **toàn bộ hệ thống** (Tất cả Chi nhánh).
  * Được phép sử dụng bộ lọc "Chi nhánh" để xem riêng lẻ hoặc xem gộp.
* **Manager / Staff (Thủ kho / Nhân viên chi nhánh):** 
  * Chỉ được phép xem số liệu thuộc **phạm vi Chi nhánh** mà họ được phân công.
  * Bộ lọc "Chi nhánh" sẽ bị ẩn hoặc mặc định khóa chặt vào Chi nhánh của họ.

*(Cả 2 nhóm đều có quyền sử dụng bộ lọc Thời gian: Hôm nay, Tuần này, Tháng này, Tùy chọn).*

## 3. Flow Diagram (Luồng Dữ liệu & Render)

```text
+----------------+       +-------------------------+       +------------------------------+
| Truy cập       | ----> | Chọn Filter (Thời gian, | ----> | Gửi API Request (Dashboard)  |
| Trang chủ (UI) |       | Chi nhánh)              |       +------------------------------+
+----------------+       +-------------------------+                    |
                                                                        v
+-------------------------------+      Yes      +-------------------------------------------+
| User là Admin / Super Admin?  | ------------> | Lọc dữ liệu TẤT CẢ Chi nhánh (Hoặc theo   |
+-------------------------------+               | Chi nhánh được chọn từ filter)            |
               | No                             +-------------------------------------------+
               v                                                        |
+-------------------------------+                                       |
| Ép cứng dữ liệu theo          |                                       |
| Chi nhánh của User hiện tại   | --------------------------------------+
+-------------------------------+                                       |
                                                                        v
+-------------------------------------------------------------------------------------------+
| TỔNG HỢP & XỬ LÝ DỮ LIỆU (AGGREGATION)                                                    |
| 1. KPIs: Tổng Tồn kho, Số Phiếu Nhập chờ xử lý, Số Phiếu Xuất chờ xử lý, Lượng Low Stock. |
| 2. Charts: Group dữ liệu Nhập/Xuất theo khoảng thời gian được lọc.                        |
| 3. Lists: Lấy 5-10 giao dịch gần nhất & Danh sách 5-10 sản phẩm sắp hết hàng.             |
+-------------------------------------------------------------------------------------------+
                                                                        |
+----------------+                                                      v
| Hiển thị lên UI| <----------------------------------------------------+
+----------------+
```

## 4. Business Rules & Layout Cụ thể (Do BA Quyết định)

Giao diện chia làm 3 khu vực chính hiển thị theo thời gian đã lọc:

### 4.1. Khu vực Thống kê KPIs (4 Thẻ Cards trên cùng)
* **Tổng Tồn Kho (Total Inventory):** Tổng số lượng sản phẩm hiện có trong kho.
* **Nhập Kho (Inbound Pending):** Số lượng phiếu nhập (Inventory Transaction - Type: IN) đang ở trạng thái `Pending`. (Màu Vàng / Xanh lam - Nhấn mạnh cần xử lý).
* **Xuất Kho (Outbound Pending):** Số lượng phiếu xuất (Inventory Transaction - Type: OUT) đang ở trạng thái `Pending`. 
* **Cảnh Báo Hết Hàng (Low Stock Alert):** Số lượng các mặt hàng có số lượng tồn nhỏ hơn hoặc bằng mức an toàn (Minimum threshold). (Màu Đỏ - Cảnh báo khẩn, rất quan trọng đối với thủ kho).

### 4.2. Khu vực Biểu đồ (Charts)
* **Biểu đồ Cột Kép (In/Out Bar Chart):** Thể hiện so sánh số lượng hàng **Nhập vào** và **Xuất ra** theo từng thời điểm (các ngày trong Tuần/Tháng). Giúp Admin/Đội kho thấy được nhịp độ làm việc của kho.
* **Biểu đồ Tròn (Inventory By Category - Optional):** Tỉ trọng tồn kho chia theo các Nhóm Danh Mục Sản phẩm để dễ tái cơ cấu kho.

### 4.3. Khu vực Danh sách hành động (Actionable Lists)
* **Giao dịch gần nhất (Recent Transactions):** Bảng hiển thị tối đa 5-10 giao dịch Xuất/Nhập kho mới nhất (Mã phiếu, Loại, Người tạo, Ngày tạo, Trạng thái). Giúp user không cần vào sổ kho vẫn check được hoạt động realtime.
* **Danh sách Cần Nhập Thêm (Low Stock Products):** Bảng liệt kê chi tiết top 5 mặt hàng sắp hết (Tên SP, Mã SKU, Lượng Tồn Còn Lại, Chi nhánh). Thủ kho nhìn vào đây có thể dễ dàng lên kế hoạch Mua hàng/Nhập thêm mà không cần thao tác lọc ở trang Sản phẩm.

## 5. Edge Cases & Rủi ro
* **Rủi ro Dữ liệu Lớn (Performance Issue):** Khi hệ thống có hàng chục nghìn giao dịch, việc query aggregation (tính tổng in/out) mỗi lần user load trang chủ sẽ gây chậm.
  * *Giải pháp đề xuất cho Dev:* Các con số KPI nếu tính toán nặng thì cân nhắc Cache lại trên server tạm vài phút hoặc dùng DB aggregation hợp lý. Không cho phép lọc khoảng thời gian quá lớn trên trang chủ.
* **Edge Case - User đổi Chi nhánh liên tục:** Nếu cơ chế lọc gặp lỗi rò rỉ (Leak), User A ở nhánh X có thể vô tình nhìn thấy số liệu KPI của nhánh Y. 
  * *Giải pháp constraint:* Lớp Service/Repository trên BE luôn phải tự động kẹp thêm điều kiện `branchId = user.branch` với nhóm không phải SuperAdmin. KHÔNG phụ thuộc vào payload (dữ liệu client gửi lên).
* **Edge Case - Sản phẩm Low Stock không giới hạn:** Nếu có 1000 sản phẩm báo đỏ, API không nên trả về cả 1000 để render lên Dashboard gây đứng trình duyệt.
  * *Giải pháp:* API List cảnh báo chỉ trả về `limit = 10` sản phẩm hết hàng mức độ tụt giảm nghiêm trọng nhất, và có kèm 1 nút "Xem tất cả" để link sang trang Danh sách filter chi tiết.

## 6. Acceptance Criteria (Tiêu chí Nghiệm thu BDD)
* **Scenario 1: Super Admin xem Dashboard**
  * **Given** tôi đăng nhập bằng tài khoản Super Admin/Admin.
  * **When** tôi truy cập Trang chủ.
  * **Then** tôi thấy bộ lọc "Chi nhánh" hiển thị tùy chọn "Tất cả chi nhánh" & tôi có thể nhìn thấy KPIs In/Out tổng kết của toàn hệ thống.
* **Scenario 2: Thủ kho (Staff/Manager) xem Dashboard**
  * **Given** tôi đăng nhập bằng tài khoản thuộc Chi Nhánh Hà Nội.
  * **When** tôi truy cập Trang chủ.
  * **Then** menu bộ lọc Chi Nhánh tự động khóa ở "Hà Nội" (Hoặc ẩn đi) & tôi CHỈ thấy được luồng Phiếu nhập/xuất, KPI tồn kho của riêng nhánh Hà Nội.
* **Scenario 3: Hiển thị đúng sản phẩm Low Stock**
  * **Given** sản phẩm A có định mức tồi thiểu = 20, tồn kho hiện tại = 5.
  * **When** tôi vào Trang chủ.
  * **Then** sản phẩm A phải xuất hiện trong danh sách "Cảnh báo Hết hàng" trên Dashboard và tham số KPI "Low Stock" tăng lên 1 (Tính riêng cho nhánh đó).
