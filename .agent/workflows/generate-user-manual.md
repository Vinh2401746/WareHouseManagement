---
description: /generate-user-manual - Workflow phân tích dự án để tạo tài liệu Hướng dẫn sử dụng chi tiết (User Manual) dựa trên codebase
---

# 🚀 Workflow: Phân tích dự án & Tạo Hướng dẫn sử dụng chi tiết (Ultimate Edition)

Workflow này định hướng Agent cách kết hợp phân tích tĩnh (đọc mã nguồn) và phân tích động (tương tác trình duyệt) để hiểu luồng nghiệp vụ từ Frontend đến Backend. Từ đó tổng hợp và sinh ra một bản Hướng dẫn sử dụng cực kỳ chi tiết, trực quan cho người dùng cuối.

## 🎯 Đầu vào (Input)
Khi khởi chạy workflow, Agent cần hỏi rõ người dùng:
1. **Phạm vi phân tích:** Toàn bộ dự án, hay chỉ một module cụ thể (VD: "Module Khách hàng", "Đăng nhập/Đăng ký").
2. **Ngôn ngữ đích của tài liệu:** (Mặc định là tiếng Việt, nếu không có chỉ định).
3. **Trạng thái chạy Local:** Hỏi xem dự án đã được chạy trên localhost chưa (VD: Frontend ở port 5173, Backend port 3000) để Agent có thể dùng Subagent chạy kiểm chứng thực tế và chụp ảnh màn hình.

---

## 🛠️ Các bước thực hiện

### Lên kế hoạch (Planning & Chunking)
1. Tạo file `.agent/plans/user_manual_plan.md` liệt kê các module dự kiến sẽ phân tích.
2. **⚠️ QUAN TRỌNG (Chống quá tải Agent):** Nếu Phạm vi phân tích là *Toàn bộ dự án*, Agent **KHÔNG LÀM TẤT CẢ CÙNG LÚC**. Agent PHẢI tạo ra một danh sách (Index) đầu mục các module, yêu cầu người dùng duyệt. Sau đó triển khai cuốn chiếu Giai đoạn 1->5 cho **TỪNG MODULE MỘT** (viết xong lưu document module này mới chạy phân tích sang module khác) để đảm bảo không bị quá tải ngữ cảnh (Context Overflow).

### Giai đoạn 1: Quét và Xây dựng Sơ đồ Luồng (Flow Mapping)
**Mục tiêu:** Nắm được danh sách màn hình và luồng liên kết các trang (Navigation Flow).
1. Sử dụng công cụ `grep_search` hoặc `view_file` để tìm kiếm và quét các file định tuyến (router) của Frontend (ví dụ: `App.tsx`, thư mục `routes`).
2. Ghi nhận danh sách các trang (Pages) và đường dẫn (URLs) tương ứng.
3. Đối chiếu với các Backend routes để thấy bức tranh toàn cảnh về các API hỗ trợ phía sau.

### Giai đoạn 2: Phân tích Tĩnh từng Màn hình (Static UI & Event Analysis)
**Mục tiêu:** Đọc source code từng màn hình để tìm tất cả các thành phần tương tác.
1. **Đọc mã nguồn UI (Frontend Component):**
   - Xác định các View lớn: Form nhập liệu, Data Table, Modal/Dialog.
   - Liệt kê TOÀN BỘ nút bấm, đường link, input, dropdown. 
   - *Lưu ý (i18n):* Nếu dự án sử dụng đa ngôn ngữ, hãy ưu tiên truy xuất text từ các file JSON/dictionary language tương ứng thay vì đọc raw key trong code đoạn giao diện.
2. **Truy xuất sự kiện (Event Tracing):**
   - Sự kiện `onClick`, `onSubmit` gắn với hàm/action nào? Bắn payload gì đi?
3. **Phân tích State và Giao diện phản hồi:**
   - Trạng thái loading, toast message thông báo thành công/thất bại có điều hướng đi đâu không.

### Giai đoạn 3: Phân tích Backend và Ngoại lệ (Backend Exceptions)
**Mục tiêu:** Đào sâu vào API để biết logic ngầm và dự đoán ngoại lệ.
1. Đọc Controller/Service ở Backend tương ứng với API call đã tìm ở Giai đoạn 2.
2. Xác định Ngoại lệ (Validation error do Frontend gửi thiếu, Business Logic error do thao tác cấm/trùng lặp, RBAC error do thiếu quyền hạn).
3. Ghi chú câu báo lỗi chính xác trả ra để mô tả vào Document.

### Giai đoạn 4: Viết và Kiểm chứng Động (Drafting & Dynamic Verification)
1. Kích hoạt tool `browser_subagent` (NẾU dự án đang chạy localhost và người dùng cho phép).
2. Yêu cầu Subagent làm lại theo kịch bản vừa phân tích ở GĐ 2 & 3: Mở trình duyệt -> Điều hướng đúng route -> Nhấn thử các nút (happy path và error path).
3. **Chụp ảnh màn hình (Screenshots)** các màn hình chính và thông báo lỗi. Lưu file chụp về thư mục theo chuẩn.
4. Render các phần text Hướng dẫn theo **Khung cấu trúc chuẩn** và NHÚNG ảnh screenshot minh họa vào tài liệu. (Viết nháp trên Markdown nội bộ trước).
5. **Đóng gói sang Word:** Export file tài liệu vừa nháp ra thành định dạng Word (`.docx`). File thành phẩm cuối cùng PHẢI được lưu ở thư mục `docs/` ngoài cùng của dự án (Ví dụ: `docs/user_manual_login.docx`).

### Giai đoạn 5: Tổng hợp và Báo cáo
1. Rà soát file Markdown (Chuyển đổi ngôn ngữ kỹ thuật thành văn phong cho người ngoài IT hiểu. Ví dụ thay vì nói "Gửi Dispatch API" thì viết là "Hệ thống sẽ cập nhật").
2. Báo cáo bằng link tài liệu Word (`.docx`) đã hoàn thiện trong thư mục `docs/` cho người dùng, chờ xác nhận (OK) để tiến qua bước/module tiếp theo.

---

## 📝 Khung cấu trúc Hướng dẫn sử dụng chuẩn (Template)
Mỗi document tương ứng với một tính năng cần viết theo cấu trúc. Sử dụng Emoji, Table, Callout chuẩn chỉnh, và **Chèn hình ảnh Screenshot** sinh động.

\`\`\`markdown
# 🎯 [Số thứ tự]. Hướng dẫn phân hệ [Tên Module] (Ví dụ: Quản lý Cửa hàng)

## 📌 Tổng quan
Mô tả khái quát module này được dùng để làm gì.

## 🧭 Cách truy cập
- Tại thanh menu bên trái, nhấn vào **[Tên Menu]** -> **[Tên Trang con]**.
- Hoặc truy cập trực tiếp tại đường dẫn: \`/home/xyz.../abc\`

*(Chèn 1 ảnh tổng quan module Screenshot tại đây)*
> ![Màn hình tổng quan module](/absolute/path/to/screenshot.jpg)

## 🖥 Giao diện & Các chức năng chính
| Tên chức năng / Thành phần | Chức năng (Làm gì?) | Trạng thái hiển thị / Quyền |
|---|---|---|
| Nút \`Thêm mới\` | Mở popup thêm mới dữ liệu | Chỉ hiện với Admin |
| Thanh tìm kiếm | Lọc dữ liệu theo tên... | Luôn hiện |

## 🕹 Hướng dẫn chi tiết theo luồng thao tác

### [Kịch bản 1]: Đăng ký/Thêm mới ...
- **Bước 1:** Nhấn nút **[Tên nút]**. Popup/màn hình nhập liệu sẽ xuất hiện.
  *(Chèn ảnh popup tại đây)*
- **Bước 2:** Điền các thông tin sau:
  - **Trường A (Bắt buộc):** Nhập thông tin X.
  - **Trường B (Tùy chọn):** Ý nghĩa là gì...
- **Bước 3:** Nhấn nút **[Xác nhận / Lưu]**.

**🔄 Trạng thái hệ thống ngầm định:** 
- ✅ **Thành công:** Hiện thông báo màu xanh "Thêm mới thành công!", bảng dữ liệu sẽ được tự động làm mới.
- ⚠️ **Các ngoại lệ thường gặp (Lỗi phát sinh):** 
  - (Cố tình) Không nhập trường chỉ định -> Khung nhập viền đỏ báo yêu cầu nhập trường bắt buộc.
  - Tên dữ liệu mới bị trùng lặp -> Bắn ra Toast "Tên này đã tồn tại".
\`\`\`

---
> 💡 **NGUYÊN TẮC QUAN TRỌNG DÀNH CHO AGENT:**
> 1. **KHÔNG TƯỞNG TƯỢNG:** Mọi hướng dẫn phải được truy xuất từ file source code thật HOẶC kết quả trả về từ `browser_subagent`.
> 2. **TƯ DUY NGƯỜI DÙNG CUỐI (End-User Mindset):** Tuyệt đối tránh các thuật ngữ chuyên sâu (như "dispatch payload", "SQL Exception", "JWT auth"), mà phải dịch thẳng ra "Hệ thống cập nhật", "Bảng thông báo đỏ", "Hết hạn đăng nhập".
> 3. **MODULE BY MODULE:** Kiên nhẫn xử lý triệt để đếm từng module, báo cáo xong kết quả trước khi sang cái mới để chống quá tải (Context Window Overflow).
