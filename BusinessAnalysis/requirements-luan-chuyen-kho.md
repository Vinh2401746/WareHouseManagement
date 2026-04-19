# Requirements – Luân chuyển kho (nội bộ chi nhánh)

**Ngày**: 2026-04-19  
**Phạm vi**: Luân chuyển giữa các kho trong *cùng chi nhánh* (Branch).  
**Nguồn bối cảnh hệ thống**: BE hiện có `InventoryTransaction` (IMPORT/EXPORT) + tồn kho theo `ProductBatch` (mỗi batch gắn với 1 warehouse), và luồng Sales trừ tồn theo batch/FEFO.

---

## 1) Problem Statement Brief

### 1.1. Vấn đề đang giải quyết
Trong vận hành kho, hàng thường cần **chuyển từ kho A sang kho B trong cùng chi nhánh** (ví dụ: gom hàng, tách hàng, luân chuyển giữa kho tổng và kho quầy). Hiện hệ thống mới có **nhập kho (IMPORT)** và **xuất kho (EXPORT)**, nhưng chưa có một nghiệp vụ “chuyển kho/luân chuyển kho” rõ ràng để:
- Theo dõi được “đi từ kho nào → sang kho nào” trên **một chứng từ duy nhất**.
- Có trạng thái duyệt/hủy phù hợp để tránh sai lệch tồn kho.
- Bảo toàn truy vết theo **lô hàng (batch/expiry)**.

### 1.2. Ai bị ảnh hưởng
- **Thủ kho/NV kho**: thao tác chuyển hàng hằng ngày.
- **Quản lý kho/Quản lý chi nhánh**: cần duyệt, đối soát.
- **Kế toán/kiểm kê**: cần truy vết và báo cáo đúng.

### 1.3. Cách làm hiện tại (workaround) & rủi ro
Workaround phổ biến là dùng **phiếu xuất** ở kho nguồn và **phiếu nhập** ở kho đích như 2 chứng từ rời rạc.
- Rủi ro: lệch số liệu nếu chỉ làm 1 chiều; khó đối soát (không có liên kết 1–1); khó xác định “đang chuyển dở”.

### 1.4. Trigger
Khi số lượng kho/khu lưu trữ tăng lên, nghiệp vụ luân chuyển xảy ra thường xuyên → cần chuẩn hóa.

---

## 2) Current System Snapshot (để bám đúng logic hiện có)

### 2.1. Tồn kho
- Tồn kho thực tế đang được biểu diễn qua `ProductBatch.quantity` theo từng `warehouse`.
- Luồng bán hàng trừ tồn theo **batch cụ thể** hoặc tự chọn theo **FEFO** (ưu tiên lô gần hết hạn).

### 2.2. Nhật ký giao dịch tồn kho
- `InventoryTransaction` đang ghi nhận giao dịch nhập/xuất theo 1 `warehouse`.
- Import có status `PENDING/COMPLETED/CANCELED`.
- Sales tạo phiếu xuất kho dạng `EXPORT` và hoàn thành ngay.

> Hệ quả yêu cầu: “Luân chuyển kho” cần đảm bảo **tồn kho giảm ở kho nguồn** và **tăng ở kho đích** theo đúng batch/expiry, đồng thời vẫn có thể truy vấn như một loại giao dịch để báo cáo.

---

## 3) Need Hierarchy (Nhu cầu & mức ưu tiên)

### Must-have (V1 bắt buộc)
1. Tạo được **Phiếu luân chuyển kho** với kho nguồn, kho đích, danh sách mặt hàng và số lượng.
2. Khi **xác nhận/duyệt** phiếu: hệ thống cập nhật tồn kho (giảm kho nguồn, tăng kho đích) theo batch/expiry.
3. Không cho phép luân chuyển quá tồn kho khả dụng (đặc biệt lưu ý batch hết hạn).
4. Có thể **hủy** phiếu khi chưa hoàn tất; hủy phải không làm lệch tồn.
5. Truy vết: xem lại lịch sử phiếu + ai tạo/ai duyệt + thời điểm.

### Should-have (nên có)
1. Hỗ trợ 2 cách chọn hàng:
   - Chọn **batch cụ thể** (nếu người dùng biết lô nào đang chuyển).
   - Hoặc hệ thống tự chia theo **FEFO** từ kho nguồn.
2. In/xuất PDF “Phiếu luân chuyển kho” tương tự phiếu nhập/xuất.

### Could-have (có thì tốt)
- Giai đoạn “đang vận chuyển / in-transit” (tồn kho ở trạng thái trung gian).

### Won’t-have (ngoài phạm vi V1)
- Luân chuyển **giữa chi nhánh**.
- Quy trình giao nhận phức tạp (nhiều điểm, nhiều chặng, ký nhận nhiều bước).
- Barcode/scan, tối ưu tuyến, tích hợp vận tải.

---

## 4) Constraints & Assumptions

### 4.1. Constraints (ràng buộc chắc chắn)
- Người dùng và dữ liệu bị giới hạn theo **chi nhánh (branch)**; kho cũng thuộc chi nhánh.
- Tồn kho theo **batch** (có expiryDate), và hệ thống đã có logic FEFO ở sales.
- Hệ thống hiện tại xử lý cập nhật tồn theo kiểu tuần tự + rollback thủ công (không giả định MongoDB transaction).

### 4.2. Assumptions (giả định cần xác nhận)
- Luân chuyển kho **không làm thay đổi giá vốn**, chỉ thay đổi vị trí lưu trữ.
- “Kho đích” nhận hàng ngay khi duyệt (không cần trạng thái vận chuyển trung gian) – đúng nhu cầu V1.

### 4.3. Rủi ro nghiệp vụ
- Nếu cập nhật tồn kho và ghi nhận chứng từ không nhất quán (lỗi giữa chừng), có thể gây lệch tồn.

---

## 5) Scope Definition (V1)

### 5.1. Đối tượng nghiệp vụ
**Phiếu luân chuyển kho** gồm:
- Kho nguồn (source warehouse)
- Kho đích (destination warehouse)
- Lý do/ghi chú (optional)
- Danh sách dòng hàng (items)
  - Sản phẩm
  - Batch (optional)
  - Số lượng

### 5.2. Trạng thái
V1 đề xuất bộ trạng thái tối giản:
- `PENDING` (đang chờ duyệt)
- `COMPLETED` (đã duyệt / đã cập nhật tồn)
- `CANCELED` (đã hủy)

### 5.3. Quy tắc nghiệp vụ (business rules)
1. Kho nguồn ≠ kho đích.
2. Tất cả items phải có quantity > 0.
3. Nếu chọn batch cụ thể:
   - Batch phải thuộc kho nguồn.
   - Batch còn hạn (expiryDate >= hôm nay) và còn đủ quantity.
4. Nếu không chọn batch:
   - Hệ thống tự động chọn batch theo FEFO ở kho nguồn.
5. Khi xác nhận phiếu:
   - Giảm tồn kho ở kho nguồn theo đúng batch đã dùng.
   - Tăng tồn kho ở kho đích:
     - Nếu chuyển theo batch: **tách thành batch mới ở kho đích** (giữ `product`, `expiryDate`, `importPrice` và các thông tin truy vết cần thiết từ batch nguồn).
6. Hủy phiếu:
   - Nếu chưa confirm: chỉ đổi status.
   - Nếu đã confirm (`COMPLETED`): **không cho hủy**. Nếu cần điều chỉnh, dùng nghiệp vụ “đảo” (tạo phiếu luân chuyển ngược) ở phiên bản sau.

---

## 6) Acceptance Criteria (định nghĩa “Done” – test được)

### AC1 – Tạo phiếu
- Given người dùng có quyền luân chuyển kho trong chi nhánh
- When tạo phiếu với kho nguồn, kho đích, items hợp lệ
- Then hệ thống tạo phiếu ở trạng thái `PENDING` và hiển thị được trong danh sách

### AC2 – Chặn kho nguồn = kho đích
- When tạo phiếu với kho nguồn == kho đích
- Then hệ thống báo lỗi và không tạo phiếu

### AC3 – Chặn xuất quá tồn
- When tạo/duyệt phiếu với quantity > tồn kho khả dụng (theo batch hoặc FEFO)
- Then hệ thống báo lỗi “không đủ tồn kho” và không cập nhật tồn

### AC4 – Duyệt phiếu làm thay đổi tồn kho 2 chiều
- Given phiếu `PENDING`
- When duyệt
- Then kho nguồn giảm đúng số lượng; kho đích tăng đúng số lượng; phiếu chuyển `COMPLETED`

### AC5 – Hủy phiếu PENDING
- Given phiếu `PENDING`
- When hủy
- Then phiếu chuyển `CANCELED` và tồn kho không thay đổi

### AC6 – Truy vết
- When xem chi tiết phiếu
- Then thấy được kho nguồn/kho đích, items, người tạo, thời gian tạo, trạng thái, (người duyệt nếu có)

---

## 7) Idea Options (để team chọn hướng triển khai – không chốt code)

### Option A (khuyến nghị – đơn giản, bám hệ thống hiện có)
- Một phiếu luân chuyển = **1 chứng từ nghiệp vụ**, nhưng khi duyệt sẽ ghi nhận **2 giao dịch**:
  - “Xuất kho nguồn”
  - “Nhập kho đích”
- Mục tiêu: tái sử dụng cách hệ thống đang báo cáo IMPORT/EXPORT.

### Option B
- Mở rộng `InventoryTransaction` để hỗ trợ loại TRANSFER và có cả kho nguồn/kho đích.
- Rủi ro: chạm schema/logic lọc/validation/reporting nhiều nơi.

---

## 8) Open Questions (cần anh xác nhận để chốt V1)
1. (ĐÃ CHỐT) Phiếu luân chuyển đã `COMPLETED` **không hủy được**; nếu cần điều chỉnh sẽ dùng nghiệp vụ “đảo” (tạo phiếu luân chuyển ngược) ở phiên bản sau.
2. (ĐÃ CHỐT) **Cần 2 bước duyệt** (NV tạo → QL duyệt).
3. (ĐÃ CHỐT) Khi chuyển theo batch một phần: **kho đích tách thành batch mới** (không gộp batch).

---

## 9) Next Step
- Chốt câu trả lời cho 3 Open Questions.
- Sau khi chốt, handoff cho agent lên **plan thực thi** (routes/controller/service + FE page + tests) và sau đó dùng `documentation-writer` để cập nhật lại HDSD (thêm mục “Luân chuyển kho”).
