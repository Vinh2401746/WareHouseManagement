const pptxgen = require("pptxgenjs");

let pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";

// Define a master slide for a professional look
pptx.defineSlideMaster({
  title: "MASTER_SLIDE",
  background: { color: "FFFFFF" },
  objects: [
    { rect: { x: 0, y: 0, w: "100%", h: 0.8, fill: { color: "003b73" } } },
    { text: { text: "HỆ THỐNG QUẢN LÝ KHO & BÁN HÀNG", options: { x: 0.5, y: 0.1, w: "90%", h: 0.6, color: "FFFFFF", fontSize: 16, bold: true } } },
    { rect: { x: 0, y: "93%", w: "100%", h: "7%", fill: { color: "f5f5f5" } } },
    { text: { text: "Đồ án tốt nghiệp / Bài tập lớn", options: { x: 0.2, y: "94%", w: "40%", h: 0.3, fontSize: 10, color: "888888" } } }
  ],
  slideNumber: { x: "90%", y: "94%", color: "888888", fontSize: 10 }
});

const DEFAULT_SLIDE = { masterName: "MASTER_SLIDE" };

// SLIDE 1
let slide1 = pptx.addSlide();
slide1.background = { color: "003b73" };
slide1.addText("HỆ THỐNG QUẢN TRỊ KHO & BÁN HÀNG ĐA CHI NHÁNH", { x: 1, y: 1.5, w: 8, h: 1.5, fontSize: 32, bold: true, color: "FFFFFF", align: "center" });
slide1.addText("SINH VIÊN THỰC HIỆN: [Tên của bạn]\nGVHD: [Tên GVHD]", { x: 1, y: 3.5, w: 8, h: 1, fontSize: 18, color: "F0F0F0", align: "center" });

// SLIDE 2
let slide2 = pptx.addSlide(DEFAULT_SLIDE);
slide2.addText("ĐẶT VẤN ĐỀ", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide2.addText(
  [
    { text: "Khó khăn hiện tại của các cửa hàng bán lẻ/kho:\n", options: { bold: true, breakLine: true } },
    { text: "• Khó kiểm soát tồn kho thực tế, nhập xuất bị chênh lệch.\n• Phân quyền lỏng lẻo, nhân viên kho này có thể xem trộm sửa dữ liệu kho khác.\n• Tách biệt giữa phần mềm quản lý kho và phần mềm bán hàng (POS).\n\n" },
    { text: "Giải pháp đề xuất:\n", options: { bold: true, breakLine: true } },
    { text: "• Xây dựng một nền tảng 'All-in-one' kết hợp cả quản lý chi nhánh, kho bãi lẫn nghiệp vụ bán hàng POS tại quầy." }
  ],
  { x: 0.5, y: 2, w: 9, h: 3, fontSize: 16, color: "333333", bullet: true }
);

// SLIDE 3
let slide3 = pptx.addSlide(DEFAULT_SLIDE);
slide3.addText("MỤC TIÊU ĐỀ TÀI", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide3.addText(
  [
    { text: "• Khả năng mở rộng (Multi-branch): Quản lý được nhiều Chi nhánh, mỗi chi nhánh sở hữu nhiều Kho.\n", options: { breakLine: true } },
    { text: "• Quy trình chặt chẽ: Tồn kho không tự động thay đổi, mọi phiếu Nhập/Xuất phải qua bước Phê duyệt của cấp quản lý.\n", options: { breakLine: true } },
    { text: "• Bảo mật dữ liệu (Data Isolation): Nhân viên cửa hàng nào chỉ đăng nhập và quản lý Cửa hàng/Kho đó (Branch Scope Authorization)." }
  ],
  { x: 0.5, y: 2, w: 9, h: 3, fontSize: 18, color: "333333", bullet: true }
);

// SLIDE 4
let slide4 = pptx.addSlide(DEFAULT_SLIDE);
slide4.addText("CÔNG NGHỆ ÁP DỤNG", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide4.addText(
  [
    { text: "• Frontend: React, TypeScript, Ant Design (Giao diện hiện đại, dễ thao tác).\n" },
    { text: "• Backend: Node.js (Xử lý mượt luồng nghiệp vụ realtime).\n" },
    { text: "• Cơ sở dữ liệu: Hệ quản trị CSDL giúp lưu vết toàn bộ hoạt động xuất/nhập/bán." }
  ],
  { x: 0.5, y: 2, w: 9, h: 3, fontSize: 18, color: "333333", bullet: true }
);

// SLIDE 5
let slide5 = pptx.addSlide(DEFAULT_SLIDE);
slide5.addText("KIẾN TRÚC PHÂN QUYỀN ĐỘC ĐÁO", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide5.addText("Admin (Global Scope)", { x: 0.5, y: 2.2, w: 4, h: 0.8, fill: { color: "DCE6F1" }, align: "center", bold: true });
slide5.addText("Thấy được mọi thứ của toàn hệ thống (Tạo cửa hàng, tạo kho).", { x: 0.5, y: 3.2, w: 4, h: 1.5, fontSize: 14 });
slide5.addText("Nhân viên (Branch Scope)", { x: 5.5, y: 2.2, w: 4, h: 0.8, fill: { color: "F2DCDB" }, align: "center", bold: true });
slide5.addText("Đăng nhập vào, nhân viên chỉ chạm được hàng và kho của cửa hàng mình quản lý. Hoàn toàn cách ly dữ liệu.", { x: 5.5, y: 3.2, w: 4, h: 1.5, fontSize: 14 });

// SLIDE 6
let slide6 = pptx.addSlide(DEFAULT_SLIDE);
slide6.addText("LUỒNG NGHIỆP VỤ CỐT LÕI (E2E)", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide6.addText("1. Khởi tạo Không gian: Chi nhánh ➜ Kho", { x: 0.5, y: 2, w: 9, h: 0.6, fill: { color: "eef2f5" }, fontSize: 14 });
slide6.addText("2. Thiết lập Dữ liệu: Đơn vị tính ➜ Nhà cung cấp ➜ Sản phẩm (Tồn = 0)", { x: 0.5, y: 2.8, w: 9, h: 0.6, fill: { color: "eef2f5" }, fontSize: 14 });
slide6.addText("3. Vận hành Input: Tạo Phiếu Nhập Kho ➜ Duyệt Phiếu ➜ Trừ tiền quỹ & Nhảy tồn kho", { x: 0.5, y: 3.6, w: 9, h: 0.6, fill: { color: "eef2f5" }, fontSize: 14 });
slide6.addText("4. Vận hành Output: Giao diện POS Bán Hàng ➜ Tính tiền ➜ Ra Hóa Đơn & Trừ Tồn", { x: 0.5, y: 4.4, w: 9, h: 0.6, fill: { color: "eef2f5" }, fontSize: 14 });

// SLIDE 7
let slide7 = pptx.addSlide(DEFAULT_SLIDE);
slide7.addText("NHẬP KHO VÀ PHÊ DUYỆT BƠM TỒN", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide7.addText("• Lên phiếu nhập thông tin hàng hóa, nhà cung cấp và kho nhận.\n• TÍNH NĂNG CHỐT CHẶN:\n Phiếu tạo xong sẽ ở trạng thái 'Đang chờ duyệt' (Tồn kho chưa nhảy).\nNgười quản lý (hoặc nhân sự có quyền) bắt buộc phải bấm OK duyệt phiếu thì Hàng mới đổ vào Kho vật lý.\nGiảm thiểu tuyệt đối rủi ro gian lận khai khống tồn kho.", { x: 0.5, y: 2, w: 9, h: 3, fontSize: 16, bullet: true });

// SLIDE 8
let slide8 = pptx.addSlide(DEFAULT_SLIDE);
slide8.addText("BÁN HÀNG TÍCH HỢP (POS)", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide8.addText("• Chọn kho xuất hàng -> Sản phẩm tương ứng sẽ hiển thị.\n• Chức năng chọn sản phẩm siêu tốc đưa vào giỏ hàng.\n• Hỗ trợ Khách hàng có sẵn (lưu thông tin) hoặc khách vãng lai mua lẹ.\n• Nút 'Tính tiền' tự động tính bù trừ tiền thừa.\n• Bấm thanh toán là hệ thống tự động xuất hóa đơn, làm sạch giỏ và trừ số lượng tự động.", { x: 0.5, y: 2, w: 9, h: 3, fontSize: 16, bullet: true });

// SLIDE 9
let slide9 = pptx.addSlide(DEFAULT_SLIDE);
slide9.addText("KẾT LUẬN & HƯỚNG PHÁT TRIỂN", { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 28, bold: true, color: "003b73" });
slide9.addText("ĐÃ ĐẠT ĐƯỢC:\nHoàn thiện một chu trình All-in-one mượt mà từ setup Master Data chặn chẽ đến ra Hóa đơn bán lẻ đa nhân sự.\n\nHƯỚNG PHÁT TRIỂN TƯƠNG LAI:\n- Cảnh báo hết hàng tự động gửi mail / SMS.\n- Tích hợp biểu đồ thống kê chuyên sâu AI.\n- Bổ sung Quét mã vạch Barcode để tính tiền nhanh hơn nữa.", { x: 0.5, y: 2, w: 9, h: 3, fontSize: 16 });

// SLIDE 10
let slide10 = pptx.addSlide();
slide10.background = { color: "003b73" };
slide10.addText("XIN TRÂN TRỌNG CẢM ƠN \n HỘI ĐỒNG ĐÃ LẮNG NGHE!", { x: 1, y: 2.5, w: 8, h: 1.5, fontSize: 36, bold: true, color: "FFFFFF", align: "center" });

pptx.writeFile({ fileName: "Slide_Bao_Ve_Do_An.pptx" }).then(fileName => {
  console.log(`Successfully created PPTX file: ${fileName}`);
});
