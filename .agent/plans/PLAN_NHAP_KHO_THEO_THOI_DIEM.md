# PLAN: NHẬP KHO HÀNG THEO THỜI ĐIỂM (BACKEND)

## Mục tiêu

- Xây dựng nghiệp vụ nhập kho hàng theo từng phiếu (inventory transaction) trên **Backend**, có ghi nhận **thời điểm nhập** rõ ràng, tách biệt với thời gian tạo phiếu.
- Mỗi phiếu nhập kho lưu đầy đủ: **nhà cung cấp**, **kho hàng**, **lý do nhập**, **người vận chuyển/giao hàng**, và danh sách **các lô sản phẩm** chi tiết trong `InventoryTransaction`.
- Tận dụng tối đa model và service `InventoryTransaction` hiện có, đặc biệt endpoint `/inventoryTransactions/import`, hạn chế breaking change.

## Non-goals (chỉ xét Backend)

- Không xử lý các nghiệp vụ **xuất kho**, chuyển kho, kiểm kê; chỉ tập trung vào **nhập kho** (`type = IMPORT`).
- Không thiết kế/triển khai UI Frontend trong plan này (chỉ chuẩn hóa API và cấu trúc dữ liệu để FE gọi).
- Không thay đổi sâu model `Product`, `ProductBatch` trừ khi thật cần thiết; ưu tiên dùng các field đã có.

## Bối cảnh hiện trạng (Backend)

- Model `InventoryTransaction`:
  - Các field chính: `type` (IMPORT/EXPORT), `reason`, `warehouse`, `supplier`, `sale`, `createdBy`, `transactionDate`, `deliveryPerson`, `items` (mỗi item gồm `product`, `batch`, `quantity`, `price`).
- Service `inventoryTransaction.service.js`:
  - Hàm `importInventory(importInventoryBody, req)`:
    - Nhận `warehouse`, `supplier`, `items`, `reason`, `deliveryPerson`.
    - Lặp qua `items`:
      - Tìm hoặc tạo `Product` theo `productCode`, với các field: `code`, `name`, `unit`, `package`, `category`.
      - Tạo `ProductBatch` với `batchCode` auto-gen, `warehouse`, `expiryDate`, `quantity`, `importPrice`, `reason`.
      - Trả về danh sách `{ product, batch, quantity, price }` để gắn vào `InventoryTransaction.items`.
    - Tạo `InventoryTransaction` với:
      - `type = INVENTORY_TRANSACTION_TYPES.IMPORT`
      - `reason` (hoặc default `INVENTORY_TRANSACTION_REASONS.PURCHASE`)
      - `warehouse`, `supplier`, `createdBy = req.user.id`, `items`, `deliveryPerson`.
- Validation `inventoryTransaction.validation.js`:
  - Schema `importInventory`:
    - Body gồm: `warehouse`, `supplier`, `reason`, `deliveryPerson`, `items[]`.
    - Mỗi `item` gồm: `productCode`, `productName`, `unit`, `packaging`, `quantity`, `price`, `expiryDate`, `category`.
    - Lưu ý: key `packaging` ở validation khác với `package` đang dùng trong service khi tạo `Product`.
- Route `inventoryTransaction.route.js`:
  - `POST /inventoryTransactions/import` → `inventoryTransactionController.importInventory` (dùng validation + service trên).

## Yêu cầu nghiệp vụ (góc nhìn Backend)

- **Phiếu nhập kho theo thời điểm**
  - Mỗi phiếu nhập có trường **thời điểm nhập** (`transactionDate`) có thể được nhận từ client (FE) và lưu vào `InventoryTransaction`.
  - Nếu client không gửi `transactionDate`, backend dùng default `Date.now`.
- **Thông tin chung của phiếu**
  - **Nhà cung cấp**: chọn từ danh sách supplier đã có.
  - **Kho hàng**: chọn từ danh sách warehouse đã có.
  - **Lý do nhập**: chọn từ một danh sách cố định (ví dụ: mua hàng, hàng trả về, điều chỉnh, khuyến mãi, khác) hoặc text free (cần confirm).
  - **Người vận chuyển / người giao hàng**: chuỗi text, không bắt buộc nhưng nên hiển thị rõ khi là nhập hàng từ nhà cung cấp.
-- **Thông tin từng lô sản phẩm**
  - Backend nhận list `items` với cấu trúc bạn mong muốn (ví dụ mẫu):
    - `productCode`
    - `productName`
    - `unit`
    - `package`
    - `quantity`
    - `price`
    - `expiryDate`
    - `category`
  - Khi nhận request, backend:
    - Tự tìm hoặc tạo `Product` theo `productCode`.
    - Tạo `ProductBatch` mới với `batchCode` sinh tự động, gắn với `warehouse`, `expiryDate`, `quantity`, `importPrice`, `reason`.
    - Tạo `InventoryTransaction` với `type = IMPORT`, link tới `warehouse`, `supplier`, `createdBy`, `deliveryPerson`, `items` là danh sách batches vừa tạo.

## Thiết kế UX / Flow (draft)

### Flow 1: Tạo phiếu nhập kho mới

- B1: User vào màn hình **“Nhập kho theo phiếu”** trong module quản lý kho.
- B2: Chọn **Kho** (dropdown bắt buộc), **Nhà cung cấp** (dropdown bắt buộc).
- B3: Chọn **Thời điểm nhập** (date/datetime picker).
- B4: Nhập **Lý do** (select hoặc input text), **Người vận chuyển** (text).
- B5: Nhập danh sách **lô hàng** bằng bảng (table) có thể thêm/xóa dòng:
  - Với mỗi dòng: nhập/scan `productCode` → nếu tồn tại thì tự fill `productName`, `unit`, `category`. Nếu không, cho phép nhập tay `productName`, chọn `category`, `unit`, `package`.
  - Nhập `quantity`, `price`, `expiryDate`.
- B6: Bấm **Lưu phiếu nhập** → FE validate (required, kiểu dữ liệu, ngày hợp lệ) → call API `/inventoryTransactions/import`.
- B7: Sau khi lưu thành công:
  - Hiển thị thông tin phiếu (code/id, ngày nhập, nhà cung cấp, kho, tổng giá trị nếu cần).
  - Optional: in phiếu / xuất PDF / quay lại danh sách phiếu nhập.

### Flow 2: Xem danh sách phiếu nhập kho

- Dùng sẵn `GET /inventoryTransactions` với filter `type=IMPORT`, `warehouse`, `supplier`, `transactionDate` (nếu cần).
- Cho phép:
  - Lọc theo ngày nhập, kho, nhà cung cấp.
  - Click vào từng phiếu để xem chi tiết (dùng `GET /inventoryTransactions/:id`).

## Thiết kế Data Model (thêm/điều chỉnh)

### Mục tiêu

- Đảm bảo model hiện tại đủ biểu đạt “phiếu nhập theo thời điểm”.
- Đồng bộ giữa payload FE, validation và service.

### Đề xuất schema / field

- **InventoryTransaction**
  - Đã có `transactionDate: Date` → cần:
    - Cho phép FE gửi lên trường `transactionDate` trong `/import` và lưu đúng giá trị user chọn.
    - Mặc định là `Date.now` nếu FE không gửi.
- **Payload `/inventoryTransactions/import`**
  - Thống nhất key `package` vs `packaging`:
    - Đề xuất: dùng `package` cho FE + validation + service cho đồng bộ với tạo `Product`.
  - Bổ sung optional field:
    - `transactionDate: Date` trong body, đi kèm validation.

### Tương thích & Migration

- Endpoint `/inventoryTransactions/import` giữ nguyên, chỉ:
  - Bổ sung thêm optional `transactionDate` trong validation.
  - Đồng bộ tên field `package`/`packaging` để tránh bug.
- Dữ liệu cũ:
  - Các phiếu nhập trước đây không có `transactionDate` explicit vẫn dùng default `Date.now` và vẫn hợp lệ.

## Thiết kế kỹ thuật / Kiến trúc (high-level)

- **Backend**
  - Cập nhật `inventoryTransaction.validation.js`:
    - Thêm `transactionDate` (date) vào schema `importInventory`.
    - Chuẩn hóa `package`/`packaging`.
  - Cập nhật `inventoryTransaction.service.js#importInventory`:
    - Nhận thêm `transactionDate` từ body, truyền vào `InventoryTransaction.create`.
    - Đảm bảo `Product.create` dùng đúng key đóng gói trùng với payload và validation.
  - Giữ nguyên cơ chế tạo `ProductBatch` và populate trong `queryInventoryTransactions`, `getInventoryTransactionById`.
- **Frontend**
  - Tạo page mới (ví dụ: `pages/app/inventory-import.tsx`) hoặc module con trong kho:
    - Form thông tin chung + table lô hàng như mô tả ở phần UX.
    - Gọi API `/inventoryTransactions/import` theo payload đã chuẩn hóa.
  - Tạo page danh sách phiếu nhập (nếu chưa có) sử dụng `GET /inventoryTransactions`.

## Các thay đổi dự kiến trong code (draft)

- `BE/src/validations/inventoryTransaction.validation.js`: thêm `transactionDate` vào schema `importInventory`, thống nhất tên field `package`/`packaging`.
- `BE/src/services/inventoryTransaction.service.js`: nhận thêm `transactionDate` từ body; truyền vào khi tạo `InventoryTransaction`; đồng bộ key `package`.
- `ware-house-fe/src/api/...`: thêm hàm call API nhập kho (`importInventory`) với payload theo chuẩn mới.
- `ware-house-fe/src/pages/app/...`: tạo UI nhập kho theo phiếu, bao gồm form thông tin chung + bảng nhập lô sản phẩm.

## Logging & Bảo mật

- Ghi log khi tạo phiếu nhập (user, kho, nhà cung cấp, thời điểm nhập, tổng số dòng).
- Chỉ user có quyền `manageInventoryTransactions` mới được gọi `/inventoryTransactions/import` (đã có middleware `auth`, FE cần ẩn menu với user không đủ quyền).

## Rủi ro / Edge cases (draft)

- **Sai lệch thời gian nhập**: User chọn `transactionDate` quá xa hiện tại → cần giới hạn (ví dụ không cho chọn ngày trong tương lai, và chỉ cho backdate trong một khoảng nhất định).
- **Trùng sản phẩm trong cùng phiếu**: Nhiều dòng có cùng `productCode` và cùng `expiryDate` → cần quyết định gộp hay tách batch (hiện tại service mỗi dòng tạo một batch mới).
- **Không đồng bộ key `package`/`packaging`**: Nếu không thống nhất sẽ dẫn đến FE gửi một key nhưng BE đọc key khác → mất dữ liệu đóng gói.

## Test plan (draft)

### Happy paths

- **Tạo phiếu nhập đơn giản**: 1 sản phẩm mới, đầy đủ thông tin, `transactionDate` = hôm nay → tạo `Product`, `ProductBatch`, `InventoryTransaction` thành công.
- **Phiếu nhập nhiều lô**: Nhiều sản phẩm khác nhau trong 1 phiếu, cùng nhà cung cấp, cùng kho → tạo nhiều batch và items đúng.
- **Backdate**: Tạo phiếu với `transactionDate` là ngày hôm qua → lưu đúng thời điểm nhập.

### Edge cases

- `quantity = 0` hoặc âm → validation BE/FE chặn.
- `expiryDate` < today (hàng đã hết hạn) → cần quyết định cho phép hay cảnh báo (chưa chốt).
- Thiếu `supplier` hoặc `warehouse` → validation BE/FE báo lỗi rõ ràng.

### Regression

- Kiểm tra lại:
  - Các API `GET /inventoryTransactions`, `GET /inventoryTransactions/:id` vẫn hoạt động với dữ liệu mới và cũ.
  - Không ảnh hưởng tới các chức năng khác đang sử dụng `InventoryTransaction`.

## Những điểm dễ thay đổi trong tương lai

- Thêm mã phiếu (`code`) auto-gen cho `InventoryTransaction` để tiện tra cứu và in ấn.
- Bổ sung tính năng chỉnh sửa/huỷ phiếu nhập, tự động điều chỉnh tồn kho.

## Nơi nên tách module/hàm

- FE: tách component `InventoryImportForm` (thông tin chung) và `InventoryImportItemsTable` (bảng lô hàng) để tái sử dụng cho các màn hình khác (vd nhập điều chỉnh).

