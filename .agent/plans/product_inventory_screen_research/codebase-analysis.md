# Codebase Analysis — Product Inventory Screen

## Backend snapshot

- **Tech stack**: Express + MongoDB with layered architecture (route → controller → service). Models live under `BE/src/models`, services under `BE/src/services`.
- **Product data**: [BE/src/models/product.model.js](../../BE/src/models/product.model.js) only stores metadata (`code`, `name`, `unit`, `minStock`, optional `imagePath`). Không có trường tồn kho → số lượng thực tế phải tính từ các bảng khác.
- **Lô hàng & giá nhập**: [BE/src/models/productBatch.model.js](../../BE/src/models/productBatch.model.js) lưu `warehouse`, `quantity`, `importPrice`, `expiryDate`. Đây là nơi duy nhất giữ giá vốn theo từng đợt nhập.
- **Giao dịch tồn kho**: [BE/src/models/inventoryTransaction.model.js](../../BE/src/models/inventoryTransaction.model.js) + [BE/src/services/inventoryTransaction.service.js](../../BE/src/services/inventoryTransaction.service.js) quản lý phiếu nhập/xuất, item bao gồm `product`, `batch`, `quantity`, `price`, `totalAmount`. Service đã populate `warehouse`, `items.product.unit`, `items.batch`.
- **Đơn bán hàng & giá bán**: [BE/src/models/sale.model.js](../../BE/src/models/sale.model.js) + [BE/src/services/sale.service.js](../../BE/src/services/sale.service.js) tạo `Sale` và tự động sinh `InventoryTransaction` type `EXPORT`. Mỗi line lưu `quantity`, `price`, `lineTotal`, tham chiếu `batch` đã trừ `ProductBatch.quantity`. ⇒ Có thể nối `Sale.items` với `ProductBatch.importPrice` để tính lợi nhuận theo đợt.
- **API surface hiện tại**:
  - `GET /v1/product` chỉ trả metadata, không có tồn kho hay lịch sử.
  - `GET /v1/inventory` trả danh sách phiếu nhập/xuất nhưng không group theo sản phẩm.
  - Chưa có endpoint nào tổng hợp “tồn kho + giá nhập + giá bán” theo sản phẩm/warehouse.

## Frontend snapshot

- FE (Vite + React 19 + TS) dùng React Query cho data fetching, Ant Design Table. Danh sách sản phẩm nằm ở [ware-house-fe/src/pages/app/products/index.tsx](../../ware-house-fe/src/pages/app/products/index.tsx).
- Route nhập kho / xuất kho ở [ware-house-fe/src/pages/app/warehouse_import_export/index.tsx](../../ware-house-fe/src/pages/app/warehouse_import_export/index.tsx).
- API client: `AxiosClient` với wrapper CRUD trong `src/api/**`. Hiện chưa có API nào lấy dữ liệu tổng hợp tồn kho.
- Thiết kế UI chuẩn: table lớn + filter top, modal/drawer cho chi tiết. Có `TableCommon` component tái sử dụng.

## Implications for new screen

- Phải dựng endpoint mới (ví dụ `/v1/reports/product-inventory`) vì không thể tái dùng API cũ.
- Để hiện lịch sử nhập/xuất + giá, cần join giữa `InventoryTransaction`, `Sale`, `ProductBatch`. Mongo không có view → phải xử lý bằng aggregation trong service hoặc map thủ công.
- FE nên reuse TableCommon + Drawer/Modal pattern, trang nằm dưới menu Warehouse/Product.
- Cần chuẩn hoá filter: keyword (code/name), warehouse, khoảng thời gian.
- Profit calculation có thể dựa vào:
  - Giá vốn = `sum(quantity_sold * batch.importPrice)`.
  - Doanh thu = `sum(sale.items.lineTotal)`.
  - Lợi nhuận = doanh thu - giá vốn.
- Chưa có store nào giữ “giá bán chuẩn” → phải lấy từ Sale items từng giao dịch.
