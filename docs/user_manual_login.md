# 🎯 1. Hướng dẫn phân hệ Hệ thống: Đăng nhập

## 📌 Tổng quan
Phân hệ Đăng nhập là cửa ngõ duy nhất để truy cập vào Hệ thống Quản Trị Kho. Phân hệ này cho phép người dùng xác thực danh tính thông qua thông tin Email và Mật khẩu, cung cấp tính năng lưu phiên đăng nhập và định tuyến người dùng về trang Khôi phục mật khẩu khi cần.

## 🧭 Cách truy cập
- **Tự động điều hướng:** Khi truy cập bất kỳ đường dẫn nào vào hệ thống nội bộ, nếu hệ thống chưa xác thực bạn, bạn sẽ tự động bị đẩy về màn hình Đăng nhập này.
- Hoặc truy cập trực tiếp tại đường dẫn mặc định: `/login` (Tùy cấu hình router).

## 🖥 Giao diện & Các chức năng chính

Màn hình hiển thị một bảng điều khiển ở giữa trang với tiêu đề chính là **"Quản Trị Kho"**.

| Tên chức năng / Thành phần | Chức năng (Làm gì?) | Trạng thái hiển thị / Điều kiện |
|---|---|---|
| Ô nhập **Email** | Nơi để nhập địa chỉ email người dùng | Bắt buộc nhập |
| Ô nhập **Password** | Nơi nhập mật khẩu (hiển thị ẩn dưới dạng dấu `*` bảo mật) | Bắt buộc nhập |
| Nút Checkbox **Lưu tài khoản** | Tick vào ô này để hệ thống ghi nhớ bạn, lần sau không cần đăng nhập lại | Luôn hiển thị |
| Đường dẫn **Quên mật khẩu** | Nhấn vào đây nếu bạn quên mật khẩu để khôi phục | Nằm ở góc bên phải |
| Nút **Đăng nhập** | Gửi thông tin của bạn lên hệ thống xác thực | Là nút to màu xanh dưới cùng |

## 🕹 Hướng dẫn chi tiết theo luồng thao tác

### [Kịch bản 1]: Đăng nhập thành công (Happy Path)
- **Bước 1:** Điền đầy đủ thông tin email vào trường **Email** và mật khẩu vào trường **Password**.
- **Bước 2:** (Tùy chọn) Nhấn vào dấu tích ở ô **Lưu tài khoản** nếu bạn đang dùng máy cá nhân. Hệ thống sẽ giữ bạn đăng nhập cho các ca làm việc sau.
- **Bước 3:** Nhấn nút xanh **[Đăng nhập]**.

**🔄 Trạng thái hệ thống ngầm định:** 
- Nút bấm sẽ xuất hiện vòng tròn chờ (Loading) - lúc này bạn không thể bấm thêm vào nút đăng nhập được nữa nhằm tránh gửi nhiều lệnh liên tiếp.
- Dữ liệu gửi đến bộ vi xử lý trung tâm và chờ xác thực người dùng.
- ✅ **Thành công:** Nếu thông tin đúng, thông báo thành công hiển thị. Trình duyệt sẽ tự động cất lưu lại Email và Password của bạn vào bộ nhớ đệm (`localStorage`) (nếu ở Bước 2 có chọn "Lưu tài khoản"). 
- Bạn được hệ thống trực tiếp chuyển vào trong Dashboard hoặc màn hình trước đó muốn vào.

### [Kịch bản 2]: Các tình huống sự cố hoặc Ngoại lệ (Exceptions)
**Hệ thống được thiết kế để phòng thủ các trường hợp sau:**
1. **Lỗi bỏ trống thông tin:**
   - *Hành động:* Chưa nhập Email mà đã bấm "Đăng nhập".
   - *Kết quả trả về:* Chữ màu đỏ "**Vui lòng nhập Email!**" sẽ hiện ra. Lệnh đăng nhập bị chặn lại (không gửi lên server).
   - *Hành động:* Chưa nhập Password mà bấm "Đăng nhập".
   - *Kết quả trả về:* Chữ màu đỏ "**Vui lòng nhập mật khẩu!**" ngay phía dưới ô đăng nhập cảnh báo.

2. **Lỗi sai thông tin (Thao tác sai/Cố ý xâm nhập):**
   - *Hành động:* Nhập Email và mật khẩu sai lệch.
   - *Kết quả trả về:* Hệ thống kiểm tra Backend và trả về màn hình thông báo lỗi (Lỗi 401 Unauthorized theo dạng thông báo Toast/Alert). Thông tin sai của bạn cũng sẽ bị rà soát loại bỏ khỏi tính năng Checkbox "Lưu tài khoản" để đảm bảo an toàn.

### [Kịch bản 3]: Khôi phục tài khoản
- **Bước 1:** Bối rối không nhớ mật khẩu? Không sao, hãy nhấn vào đường link xanh **"Quên mật khẩu"**.
- **Bước 2:** Hệ thống lập tức bỏ qua luồng truy cập và chuyển hướng đưa bạn đến Màn hình Khôi phục (`/forgot-pass`) để xác minh danh tính qua Email.
