# PLAN: Sửa lỗi tài khoản Admin không xem được dữ liệu Màn Tổng Quan

## 🎯 Mục tiêu
- Tìm ra nguyên nhân gốc rễ vì sao tài khoản mang role `admin` lại không xem được dữ liệu (kết quả trả về là 0 hoặc danh sách trống) trong màn Dashboard.
- Đưa ra giải pháp xử lý triệt để theo đúng quyền hạn (RBAC) và scope (Branch/Warehouse) của hệ thống.

## 🔍 Bối cảnh hiện trạng (Từ kết quả điều tra Codebase)

Dựa vào cấu trúc code hiện hành, màn hình tổng quan gọi API `GET /v1/dashboard/overview`.
Luồng xử lý dữ liệu cho Dashboard đang diễn ra như sau:
1. File `dashboard.service.js` sẽ tính toán các KPI, lấy dữ liệu Import/Export, tồn kho... dựa theo danh sách `warehouseIds`.
2. Danh sách `warehouseIds` này được phân quyền bởi hàm `resolveScopedWarehouseIds` ở file `branchScope.js`.
3. Có 2 luồng phân quyền chính cho role:
   - **Global Scope**: Lấy tất cả mọi Kho hàng nếu user có quyền Global (`isGlobalScope === true`).
   - **Branch Scope**: Nếu user thuộc về 1 chi nhánh (Branch), truy vấn DB lấy ra tất cả Kho hàng (`Warehouse`) do chi nhánh đó quản lý. Nếu không có Kho hàng nào hoặc nếu User chưa được gán chi nhánh, nó sẽ gán filter `EMPTY_OBJECT_ID`, dẫn tới kết quả query rỗng (hiển thị 0 tất cả).

## ⚠️ Nguyên nhân trực tiếp (Giả thuyết dựa trên logic code)

Vì tài khoản `admin` hiện lên màn tổng quan trống trơn, nguyên nhân chắc chắn rơi vào 1 trong số các khả năng sau:

1. **Khả năng 1: Gán sai Scope của Role `admin`**
   - Tài khoản `admin` được mong muốn hoạt động ở phạm vi Toàn hệ thống (Global), nhưng trong DB bảng `Role`, tài khoản này lại không được set trường `scope: 'global'`.
   - Kết quả là hệ thống coi `admin` như một role của chi nhánh, và logic phân nhánh bắt đầu hoạt động.

2. **Khả năng 2: Tài khoản `admin` là Branch-scoped, nhưng chưa được gán Branch (Chi nhánh) cụ thể**
   - Tài khoản là Quản lý chi nhánh (`admin`) nhưng user record trong collection `User` lại đang để trường `branch` là `null`. Do đó hệ thống không biết admin thuộc chi nhánh nào -> trả về `[]` Kho hàng -> Không thấy gì ở Dashboard.
   
3. **Khả năng 3: Chi nhánh của tài khoản `admin` thực sự VẪN CHƯA CÓ KHO HÀNG (Warehouse) nào**
   - Tài khoản đã được gán Branch. Tuy nhiên `Warehouse.find({ branch: branchId })` lại trả về danh sách rỗng (Chi nhánh này chưa tạo kho hàng). -> Không có Kho -> Không có Giao dịch.

4. **Khả năng 4: Chi nhánh đã có kho nhưng CHƯA CÓ GIAO DỊCH (Transaction)**
   - Đã có chi nhánh, đã có kho, nhưng kho là kho mới, chưa có bất kỳ Phiếu nhập/xuất nào (Cái này là hiển nhiên, nhưng lưu ý).

## 💡 Đề xuất & Hành động cần thiết

Để xử lý dứt điểm, chúng ta cần xác định rõ nghiệp vụ cho role `admin` này.
**Mình có những câu hỏi cần bạn Confirm (chọn Option):**

**Câu hỏi 1:** Bạn định hình tài khoản mang role `admin` là Quản trị viên Toàn hệ thống (thấy hết mọi dữ liệu của tất cả Chi nhánh), hay là Quản trị viên của 1 Chi nhánh cụ thể (chỉ được thấy dữ liệu Kho của chi nhánh mình)?
- **Option A (Chuẩn cấu trúc hệ thống multi-tenant):** Role `super_admin` là toàn hệ thống (Global), còn Role `admin` là quản trị chi nhánh (Branch scope). → Nếu bạn chọn Option này, lỗi chỉ là do tài khoản admin đó đang thiếu (chưa được gán vào chi nhánh nào), hoặc chi nhánh của admin đó chưa tạo Kho hàng. (Chỉ cần tạo kho/gán lại cho user từ giao diện super_admin là tự động hết).
- **Option B:** Role `admin` cũng là Quản trị viên toàn hệ thống, giống như `super_admin` (Global scope). → Nếu bạn chọn Option này, mình sẽ check và viết script update DB để biến Role `admin` thành `global`.

📝 **Test plan**:
- Đối với tuỳ chọn A: Đăng nhập super_admin -> update user admin -> chọn chi nhánh. Sau đó thêm 1 Kho cho chi nhánh đó. Quay lại tài khoản admin sẽ xem được DB.
- Đối với tuỳ chọn B: Chạy update bằng script: `await Role.updateOne({ key: 'admin' }, { scope: 'global' })`. Lập tức Admin sẽ xem được hết.
