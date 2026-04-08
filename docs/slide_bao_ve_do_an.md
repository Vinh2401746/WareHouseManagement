# KỊCH BẢN & CẤU TRÚC SLIDE BẢO VỆ ĐỒ ÁN
**Đề tài:** Hệ thống Quản Lý Kho & Bán Hàng (Warehouse Management System)

---

## SLIDE 1: TRANG BÌA
- **Tiêu đề:** Xây dựng Hệ thống Quản trị Kho Hàng và Bán hàng đa chi nhánh
- **Sinh viên thực hiện:** [Tên của bạn]
- **Giảng viên hướng dẫn:** [Tên GVHD]
- *(Hình ảnh: Chèn 1 ảnh Dashboard tổng quan của phần mềm)*

---

## SLIDE 2: ĐẶT VẤN ĐỀ
- **Khó khăn hiện tại của các cửa hàng bán lẻ/kho:** 
  - Khó kiểm soát tồn kho thực tế, nhập xuất bị chênh lệch.
  - Phân quyền lỏng lẻo, nhân viên kho này có thể xem trộm/sửa dữ liệu kho khác.
  - Tách biệt giữa phần mềm quản lý kho và phần mềm bán hàng (POS).
- **Giải pháp đề xuất:** Xây dựng một nền tảng "All-in-one" kết hợp cả quản lý chi nhánh, kho bãi lẫn nghiệp vụ bán hàng POS tại quầy.

---

## SLIDE 3: MỤC TIÊU ĐỀ TÀI
*Nhấn mạnh 3 giá trị cốt lõi của phần mềm:*
1. **Khả năng mở rộng (Multi-branch):** Quản lý được nhiều Chi nhánh, mỗi chi nhánh sở hữu nhiều Kho.
2. **Quy trình chặt chẽ:** Tồn kho không tự động thay đổi, mọi phiếu Nhập/Xuất phải qua bước **Phê duyệt** của cấp quản lý.
3. **Bảo mật dữ liệu (Data Isolation):** Nhân viên cửa hàng nào chỉ đăng nhập và quản lý Cửa hàng/Kho đó (Branch Scope Authorization).

---

## SLIDE 4: CÔNG NGHỆ ÁP DỤNG
- **Frontend:** React, TypeScript, Ant Design (Giao diện hiện đại, dễ thao tác).
- **Backend:** Node.js (Xử lý mượt luồng nghiệp vụ realtime).
- **Cơ sở dữ liệu:** Hệ quản trị CSDL giúp lưu vết toàn bộ hoạt động xuất/nhập/bán.

---

## SLIDE 5: KIẾN TRÚC PHÂN QUYỀN ĐỘC ĐÁO
*(Khuyên dùng: Vẽ hoặc mô tả một sơ đồ cây)*
👉 **Admin (Global Scope):** Thấy được mọi thứ của toàn hệ thống.
👉 **Nhân viên (Branch Scope):** 
- Bước 1: Admin tạo Cửa hàng & Kho.
- Bước 2: Tạo Role (Phân quyền) với phạm vi `Branch`.
- Bước 3: Cấp tài khoản cho nhân viên, GẮN CỨNG vào 1 Cửa hàng. 
- **Kết quả:** Đăng nhập vào, nhân viên chỉ chạm được hàng và kho của cửa hàng mình quản lý.

---

## SLIDE 6: LUỒNG NGHIỆP VỤ CỐT LÕI (END-TO-END)
*(Lấy ý từ file user_manual_e2e_flow.txt - Trình bày dạng sơ đồ mũi tên)*
1. Khởi tạo Không gian: `Chi nhánh` ➜ `Kho`
2. Thiết lập Dữ liệu: `Đơn vị tính` ➜ `Nhà cung cấp` ➜ `Sản phẩm (Tồn = 0)`
3. Vận hành Input: `Tạo Phiếu Nhập Kho` ➜ `Duyệt Phiếu` ➜ *(Tồn kho nhảy)*
4. Vận hành Output: `Giao diện POS Bán Hàng` ➜ `Tính tiền` ➜ *(Ra Hóa Đơn & Trừ Tồn).*

---

## SLIDE 7: CHỨC NĂNG NỔI BẬT 1 - BƠM TỒN VÀ DUYỆT KHO
- **Demo / Ảnh chụp:** Màn hình Phiếu Nhập.
- **Điểm nhấn để "khoe" với hội đồng:** Tính năng Trạng thái. Phiếu tạo xong chưa vào kho ngay (Đang chờ duyệt). Người quản lý phải xác nhận bấm **OK** thì tiền mới xuất quỹ, hàng mới vào kho. Giảm thiểu cực độ tuyệt đối rủi ro gian lận.

---

## SLIDE 8: CHỨC NĂNG NỔI BẬT 2 - BÁN HÀNG TÍCH HỢP
- **Demo / Ảnh chụp:** Màn hình Hóa Đơn Bán Hàng.
- **Điểm nhấn:** 
  - Giao diện POS chọn hàng tạch tạch nhanh chóng, liên kết tồn của đúng Cửa hàng đó.
  - Hỗ trợ khách vãng lai không cần nhập liệu hệ thống phức tạp.
  - Bấm Thanh toán là dọn sạch giỏ tự động.

---

## SLIDE 9: KẾT LUẬN & HƯỚNG PHÁT TRIỂN
- **Đã đạt được:** Hoàn thiện 1 chu trình mượt mà từ setup Master Data chặn chẽ đến ra Hóa đơn bán lẻ.
- **Hướng phát triển tương lai:** Cảnh báo hết hàng tự động gửi mail, tích hợp AI báo cáo doanh thu, Tích hợp máy quét mã vạch (Barcode Scanner).

---

## SLIDE 10: LỜI CẢM ƠN
- Em xin cảm ơn Hội Đồng đã theo dõi! Xin mời các thầy cô đặt câu hỏi.

===================================================
💡 MẸO TRÌNH BÀY CHO SINH VIÊN KHI DEMO:
1. Đăng nhập bằng acc `Admin` để setup cấu hình nhánh/kho.
2. Nhập kho một lô "Bia" hoặc "Bánh" và phải "nhấn nút Duyệt" thật chậm thao tác này để thầy cô thấy.
3. Lập tức Out acc Admin ra.
4. Đăng nhập bằng account Nhân viên quầy thu ngân (Tạo ngầm từ trước).
5. Bấm vào màn POS Bán hàng lấy 2 phần Bia "Tính tiền". 
6. Show Hóa đơn -> Hoàn tất điểm 10 tuyệt đối!
===================================================
