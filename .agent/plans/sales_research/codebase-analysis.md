# Codebase Analysis - Phân hệ Bán Hàng (Sales)

## 📁 Files liên quan đã khám phá
**Backend:**
- `BE/src/models/sale.model.js`: Model hoá đơn bán hàng (chưa có paymentMethod, paymentStatus, customer ref).
- `BE/src/services/sale.service.js`: Xử lý tạo Sale và trừ kho (thiếu Transaction DB, hardcode thuế/chiết khấu = 0).
- `BE/src/controllers/sale.controller.js`: Xử lý request API.

**Frontend:**
- `ware-house-fe/src/pages/app/sales/product_invoice_list.tsx`: Component giỏ hàng và thanh toán (chưa truyền warehouse, tax, discount xuống API).
- `ware-house-fe/src/pages/app/sales/create_invoice.tsx`: Layout chọn sản phẩm.

## ⚠️ Vấn đề kỹ thuật (Technical Debts)
1. **Missing MongoDB Transaction:** Lặp qua mảng items để trừ `batch.quantity` bằng hàm `.save()`. Nếu lỗi giữa chừng sẽ gây mất hàng thật.
2. **Missing Warehouse Payload:** Frontend mutate form gửi API đang để cấu hình cứng `warehouse: ''`. Gây lỗi BE khi cố popluate/findById.
3. **Tax & Discount Lost in Translation:** UI có tính nhưng không dispatch xuống Backend. Backend ngầm định set về 0 từ line items.

## 🎯 Gaps Nghiệp vụ (Business Gaps)
1. **Khách hàng:** Đang dùng String để lưu `customerName`. Không có quản lý khách quy chuẩn (Phone, Email, Debt).
2. **Công nợ & Thanh toán:** Flow FE cho phép nhập "Tiền khách đưa", có thể tính ra việc khách nợ tiền, nhưng BE không lưu vết `paymentStatus` hay `paidAmount`.
3. **Lưu Nháp (Draft):** Nút "Lưu tạm" FE đang code là `setItems([])` -> Huỷ giỏ hàng thay vì lưu Draft.
4. **Hoàn/Trả hàng:** Cần design luồng nhập lại hàng hoá.
