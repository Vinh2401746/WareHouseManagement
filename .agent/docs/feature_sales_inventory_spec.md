# BRD/PRD: Nâng Cấp Luồng Bán Hàng & Tồn Kho (POS - WMS)

## 1. Tóm tắt
Mô-đun Bán Hàng (Sales/POS) hiện tại đang mất đồng bộ với Mô-đun Tồn Kho (Product Inventory). Các lỗi nghiêm trọng bao gồm: 
- Không có Giá Bán Mặc Định (Selling Price), thu ngân phải tự nhớ và nhập tay.
- Màn hình POS hiển thị Tổng Tồn Kho của Toàn Chi Nhánh thay vì Tồn Kho Thực Tế tại Kho Đang Bán, dẫn đến việc bán khống (Overselling) và văng lỗi Hệ thống khi lập Hóa đơn.
Tính năng này sẽ tái cấu trúc lại luồng giao tiếp giữa POS và WMS để đảm bảo Dữ Liệu Tồn & Dữ Liệu Giá chính xác 100%.

## 2. Actor & Use Cases
- **Actor:** Nhân viên Bán Hàng (Cashier) / Quản lý Cửa Hàng.
- **Use Cases:**
  - Chọn Kho Bãi làm ca làm việc trước khi mở màn hình Bán.
  - Quét mã/Tìm kiếm sản phẩm hiển thị đúng Tồn Kho của Kho đang đứng.
  - Tự động điền Giá Bán vào Giỏ Hàng thay vì nhập tay.

## 3. Flow Diagram (Luồng Nghiệp Vụ Chốt)

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ BƯỚC 1: CA LÀM  │       │ BƯỚC 2: POS     │       │ BƯỚC 3: GIỎ HÀNG│
│ Chọn Kho Xuất   │ ───►  │ Load Danh Sách  │ ───►  │ Kéo Giá Bán     │
│ (Bắt buộc tiên  │       │ Sản phẩm & Tồn  │       │ từ Database đổ  │
│  quyết)         │       │ [CHỈ CỦA KHO ĐÓ]│       │ tự động vào UI  │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
┌─────────────────┐       ┌─────────────────┐       ┌────────▼────────┐
│ BƯỚC 6: XUẤT KHO│       │ BƯỚC 5: XỬ LÝ   │       │ BƯỚC 4: VALIDATE│
│ API tạo hóa đơn │ ◄───  │ Chọn Batch FIFO │ ◄───  │ Cấm gõ vượt Tồn │
│ trừ tồn kho db  │       │ (Hết hạn gần    │       │ hiển thị (Kho   │
│ update Công nợ  │       │ thì xuất trước) │       │ đang bán)       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

## 4. Business Rules & Validations
**Quy tắc 1: Bắt buộc chọn Kho (Mandatory Warehouse Action)**
- Nhân viên vào trang `Create Invoice` -> Pop-up hoặc Dropdown "Chọn Kho Xử Lý Giao Dịch" xuất hiện. Bắt buộc chọn mới hiển thị Danh sách Hàng.
- Biến `warehouseId` lưu vào Context/State.

**Quy tắc 2: Tồn Kho Cục Bộ (Local Inventory Enforcement)**
- API Trả danh sách Item để Bán PHẢI LÀ API Get tồn kho có filter `warehouseId`. Không sử dụng số `totalStock` gộp chi nhánh.

**Quy tắc 3: Giá Bán Fixed (Selling Price)**
- Thêm trường `sellingPrice` vào `Product` schema.
- Khi đẩy Item vào Giỏ Hàng (`addToCart`), giá sẽ là `item.sellingPrice`.

**Quy tắc 4: Trừ Kho Lô (Batch Deduction FIFO)**
- Khi BE xử lý mảng items mà không có `batchId`, tự động tìm tất cả `ProductBatch` của `product_id` và `warehouse_id`. Sắp xếp mốc `expiryDate: ASC` (Hết hạn gần xuất trước).
- Transaction bọc toàn diện, nếu tồn kho lô âm -> Hoàn tác toàn bộ.

## 5. Edge Cases & Rủi ro
- **Rủi ro 1: Lô hàng cận date (Expired Batches):** Backend query Batch FIFO hiện loại bỏ các lô hàng đã Expired. Nếu Kho chỉ còn lô hết hạn, màn hình POS có hiện tồn không? -> *Giải pháp:* API POS Query không đếm Lô hết hạn vào `totalStock` hiển thị.
- **Rủi ro 2: Sản phẩm chưa set Giá bán:** Nếu `sellingPrice` rỗng/bằng 0 -> *Giải pháp:* FE cảnh báo "Sản phẩm chưa cập nhật giá bán", ép nhập tay hoặc báo Quản lý.
- **Rủi ro 3: Tách lô (Split Batches):** 1 Invoice Item yêu cầu Số lượng 10. Lô A còn 4, Lô B còn 6. -> *Giải pháp:* Backend lặp qua các Lô để trừ dần (4 Lô A rồi 6 Lô B) thay vì văng lỗi do 1 Lô không kham nổi sự kiện 🛒. Chức năng này BE đã có khung nhưng cần review chống rớt.

## 6. Acceptance Criteria (BDD BDD: Given-When-Then)
- **Scenario 1: Hiển thị giá và tồn** 
  - *Given* Sản phẩm A tồn 5 ở Kho 1, tồn 10 ở Kho 2, Giá Bán 50,000.
  - *When* Nhân viên chọn Kho 1 trên màn hình POS.
  - *Then* Sản phẩm A hiển thị Tồn Kho = 5, khi thêm vào giỏ Giá Cố Định = 50,000.
- **Scenario 2: Trừ Lô**
  - *Given* Sản phẩm A (Giá Bán 50,000) có Lô 1 (Tồn 2, Hạn 2024), Lô 2 (Tồn 5, Hạn 2025) ở Kho 1.
  - *When* Khách mua 3 Sản phẩm A.
  - *Then* Hệ thống tự tìm và trừ: 2 cái Lô 1 (Về 0), 1 cái Lô 2 (Còn 4). Tổng Bill: 150,000. Lịch sử trừ lô ghi rõ 2 dòng.
