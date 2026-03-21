# PLAN: PRODUCT_IMAGE

## Mục tiêu

- Cho phép mỗi sản phẩm có 1 ảnh đại diện được upload ngay khi tạo/cập nhật.
- Lưu file ảnh trên BE và trả về URL ảnh trong API danh sách/chi tiết sản phẩm.
- Cấu hình static endpoint để FE hiển thị ảnh trực tiếp qua HTTP.

## Non-goals (chưa làm ở phase này)

- Không hỗ trợ nhiều ảnh hoặc gallery theo sản phẩm.
- Chưa hỗ trợ import/export Excel chứa dữ liệu ảnh.
- Không bàn tới CDN/offload file sang dịch vụ lưu trữ bên ngoài.

## Bối cảnh hiện trạng

- `Product` schema ([BE/src/models/product.model.js](BE/src/models/product.model.js)) chỉ có các trường văn bản/số, chưa có chỗ lưu ảnh.
- CRUD sản phẩm ([BE/src/controllers/product.controller.js](BE/src/controllers/product.controller.js), [BE/src/services/product.service.js](BE/src/services/product.service.js)) nhận JSON, không xử lý multipart.
- Validation ([BE/src/validations/product.validation.js](BE/src/validations/product.validation.js)) dùng Joi cho JSON thuần.
- Upload middleware hiện tại ([BE/src/middlewares/upload.js](BE/src/middlewares/upload.js)) chỉ cho Excel (memory storage).
- Ứng dụng Express ([BE/src/app.js](BE/src/app.js)) chưa cấu hình `express.static`, nên không có đường dẫn công khai tới file.

## Yêu cầu nghiệp vụ (đã chốt)

- **Ảnh chính tùy chọn**: Mỗi sản phẩm có tối đa 1 ảnh đại diện; có thể bỏ trống.
- **Upload ngay trong CRUD**: API `POST /product` và `PUT /product/:id` nhận multipart (trường `image`). Nếu không kèm ảnh thì vẫn xử lý JSON bình thường.
- **Lưu file tại server**: Ảnh được ghi xuống ổ đĩa BE, phục vụ qua static endpoint để FE hiển thị bằng URL trả về trong response.
- **Import/Export Excel giữ nguyên**: Hiện không nhập/xuất ảnh qua Excel, tránh làm phức tạp file mẫu.

## Thiết kế UX / Flow

### Tạo sản phẩm có ảnh

- FE gửi `multipart/form-data`, phần text chứa `code`, `name`, ...; phần file đặt field name `image`.
- BE validate text fields bằng Joi (vẫn required như hiện tại) và kiểm tra optional file.
- Nếu có file hợp lệ → lưu vào thư mục `uploads/products`; lưu đường dẫn tương đối vào DB.
- Response trả JSON sản phẩm, bổ sung trường `imageUrl` (URL đầy đủ kết hợp static base + path lưu).

### Cập nhật sản phẩm

- Hỗ trợ 3 trường hợp: upload ảnh mới (ghi đè, xoá file cũ nếu cần), giữ nguyên (không gửi file), hoặc yêu cầu xoá (gửi flag `removeImage`).
- Khi trả về danh sách/chi tiết, FE đọc `imageUrl`; nếu null → hiển thị placeholder.

## Thiết kế Data Model

### Mục tiêu

- Lưu trữ đường dẫn file ảnh (không nhúng binary) và dễ dàng dựng URL public.

### Đề xuất schema

- Thêm trường mới trong `productSchema`:
  - `imagePath: { type: String, trim: true }` — lưu đường dẫn tương đối tới file (ví dụ `products/1711010101-abc.jpg`).
- Khi trả JSON, enrich thành `imageUrl = ${config.staticBaseUrl}/products/...` trong controller hoặc qua custom getter.

### Tương thích & Migration

- Trường mới là optional → không ảnh hưởng dữ liệu cũ.
- Không cần migration; các bản ghi hiện tại mặc định không có ảnh.

## Thiết kế kỹ thuật / Kiến trúc

### Middleware upload ảnh & chuẩn hóa payload

- Tạo middleware riêng, ví dụ `middlewares/uploadImage.js`, dùng `multer.diskStorage`.
- Cấu hình:
  - Thư mục lưu: `uploads/products` (tạo nếu chưa tồn tại).
  - Tên file: `${Date.now()}-${slug(code || name)}.<ext>` để tránh trùng.
  - `fileFilter`: giới hạn `image/jpeg`, `image/png`, `image/webp`.
  - `limits.fileSize`: ~2MB (tùy chỉnh qua config nếu cần).
- Thứ tự middleware cho `POST /product` và `PUT /product/:id`:
  1. `auth('manageProducts')`
  2. `uploadProductImage.single('image')` (đọc multipart)
  3. `normalizeProductPayload` (middleware mới: convert `minStock`/`removeImage` string → number/boolean, trim text)
  4. `validate(productValidation.*)` (Joi được feed dữ liệu đã chuẩn hóa)
  5. Controller
- `normalizeProductPayload` cần xoá file vừa upload nếu phát hiện invalid type trước khi next lỗi để tránh rác.

### Xử lý controller/service

- Controller lấy `req.file` và `req.body` (multer đã parse). Chuẩn hoá:
  - Body text có thể ở dạng string → cần convert số (`minStock`) bằng `Number` trước khi validate.
  - Nếu có `req.file`, set `imagePath`.
- Service lưu `imagePath` vào DB. Khi update:
  - Nếu `removeImage === true` hoặc upload file mới → xoá file cũ bằng `fs.promises.unlink` (best effort).
- Khi trả response, append `imageUrl`:
  - Viết helper `buildProductResponse(product)` để set `imageUrl = imagePath ? `${config.file.publicBase}/${imagePath}` : null`.

### Static endpoint

- Thêm `const path = require('path');` và cấu hình trong [BE/src/app.js](BE/src/app.js):
  ```js
  const staticRoot = path.join(__dirname, '../uploads');
  app.use('/static', express.static(staticRoot, { maxAge: '30d' }));
  ```
- Thư mục `uploads` nên được gitignore.

### Validation

- Update Joi schemas để chấp nhận `removeImage` (boolean optional) và vẫn validate các field cũ.
- Do body tới ở dạng multipart, sau khi multer parse, các field vẫn là string → cần convert trước khi validate (hoặc dùng custom Joi transform).

### Excel import/export

- Giữ nguyên luồng hiện tại; không đọc/ghi `imagePath`.

## Các thay đổi dự kiến trong code

- `BE/src/models/product.model.js`: thêm trường `imagePath` và logic toJSON (nếu cần) để expose `imageUrl`.
- `BE/src/middlewares/uploadImage.js` (mới): cấu hình multer cho ảnh.
- `BE/src/middlewares/normalizeProductPayload.js` (mới): convert các field từ multipart trước Joi.
- `BE/src/routes/v1/product.route.js`: thay đổi thứ tự middleware theo flow nêu trên cho POST/PUT.
- `BE/src/controllers/product.controller.js`: chuyển sang nhận multipart, dựng payload, thêm `imageUrl` trong response.
- `BE/src/services/product.service.js`: lưu `imagePath`, handle remove/replace, helper build response, xoá file khi delete.
- `BE/src/validations/product.validation.js`: cho phép `removeImage`, đảm bảo các trường text parse được.
- `BE/src/app.js`: mount `express.static('/static', uploadsPath)`.
- `BE/.gitignore`: bảo đảm ignore `uploads/` nếu chưa có.
- `BE/src/constants/responseMessages.js`: bổ sung message lỗi file ảnh (mime/size).
- `BE/src/config/config.js`: thêm config `file.uploadDir`, `file.staticPrefix` nếu muốn centralize.

## Logging & Bảo mật

- Log lỗi khi lưu/xoá file thất bại (không log đường dẫn tuyệt đối ra ngoài nếu không cần).
- Kiểm soát MIME và kích thước file tại middleware, tránh upload file độc hại.
- Static endpoint chỉ phục vụ đọc; đảm bảo không cho upload qua GET.

## Rủi ro / Edge cases

- **Dung lượng tăng**: Lưu trên disk có thể chiếm chỗ → cần policy dọn file không dùng (ghi TODO nếu cần cron cleanup).
- **Race condition khi update song song**: Hai yêu cầu PUT cùng lúc có thể ghi đè ảnh. Giải pháp: thao tác cuối cùng thắng; FE cần confirm trước khi cho phép sửa đồng thời.
- **Multer + Joi**: Body dạng multipart cần convert trước validate; nếu quên sẽ dẫn tới `minStock` luôn là string → sai validation. Cần helper rõ ràng.
- **Xoá sản phẩm bỏ sót file**: Nếu `deleteProductById` không xoá file, ổ đĩa sẽ đầy theo thời gian → service phải gọi `removeProductImage` khi xoá, log lỗi nếu thất bại.

## Test plan

### Happy paths

- **Tạo sản phẩm kèm ảnh**: POST multipart với ảnh hợp lệ → 201, `imageUrl` đúng, file tồn tại trong `uploads/products`.
- **Tạo không có ảnh**: POST chỉ text → 201, `imageUrl = null`.
- **Cập nhật thay ảnh**: PUT với file mới → 200, `imageUrl` đổi, file cũ bị xoá.
- **Cập nhật removeImage**: PUT với `removeImage=true` → ảnh bị xoá, `imageUrl = null`.
- **GET danh sách/chi tiết**: trả `imageUrl` đầy đủ.

### Edge cases

- Upload file quá 2MB hoặc sai MIME → 400 với message rõ ràng.
- Upload ảnh nhưng thiếu field bắt buộc (VD: `code`) → Joi báo lỗi, file vừa lưu cần xoá (rollback) → test đảm bảo middleware cleanup.
- `PUT` gửi `removeImage=true` nhưng không có ảnh trước đó → hệ thống không crash, trả JSON bình thường.

### Regression

- Excel import/export hoạt động như cũ (không phụ thuộc ảnh).
- Các API không upload (GET/DELETE) vẫn hoạt động; auth/permissions không đổi.
- Delete product xoá luôn file ảnh; thêm test đảm bảo không còn file sau khi gọi DELETE.

## Những điểm dễ thay đổi trong tương lai

- **Đổi sang lưu S3/CDN**: Chỉ cần thay storage adapter trong `uploadImage` và logic build URL.
- **Multiple images/gallery**: Mở rộng schema thành mảng `images[]` khi có yêu cầu gallery.

## Nơi nên tách module/hàm

- `normalizeProductPayload(body)` trong controller/service để convert multipart fields trước validate.
- `buildImageUrl(imagePath)` helper để tái sử dụng và dễ đổi static prefix.
