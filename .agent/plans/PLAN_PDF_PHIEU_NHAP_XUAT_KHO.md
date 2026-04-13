# PLAN: Xem & Tai PDF Phieu Nhap/Xuat Kho

## Muc tieu

- Them chuc nang xem (preview) va tai PDF cho phieu nhap va phieu xuat.
- Ho tro tai PDF tu danh sach va tu trang chi tiet.
- PDF A4, co watermark khi trang thai CANCELED.
- Ten file theo mau `Phieu_Nhap_{date}_{id}` hoac `Phieu_Xuat_{date}_{id}`.
- QR code tro ve trang chu.

## Non-goals (chua lam o phase nay)

- Tao endpoint render PDF o backend (se render tai frontend tu HTML).
- Them field `code` rieng cho phieu (hien dung `id`).
- Them chuc nang in (print) rieng.

## Boi canh hien trang

- Danh sach phieu nhap/xuat: [ware-house-fe/src/pages/app/warehouse_import_export/index.tsx](ware-house-fe/src/pages/app/warehouse_import_export/index.tsx)
- Chi tiet phieu: [ware-house-fe/src/pages/app/warehouse_import_export/detail/index.tsx](ware-house-fe/src/pages/app/warehouse_import_export/detail/index.tsx)
- API FE inventory: [ware-house-fe/src/api/inventory/inventory.ts](ware-house-fe/src/api/inventory/inventory.ts)
- BE co model va populate: [BE/src/models/inventoryTransaction.model.js](BE/src/models/inventoryTransaction.model.js), [BE/src/services/inventoryTransaction.service.js](BE/src/services/inventoryTransaction.service.js)
- FE da co pattern export PDF va template A4 cho hoa don ban hang: [ware-house-fe/src/pages/app/sales/utils/export_invoice_pdf.ts](ware-house-fe/src/pages/app/sales/utils/export_invoice_pdf.ts), [ware-house-fe/src/pages/app/sales/components/invoice_a4.tsx](ware-house-fe/src/pages/app/sales/components/invoice_a4.tsx)
- Thu vien `html2pdf.js` va `qrcode.react` da duoc add trong [ware-house-fe/package.json](ware-house-fe/package.json)

## Yeu cau nghiep vu (da chot)

- **Pham vi**: ca phieu nhap (IMPORT) va phieu xuat (EXPORT).
- **Vi tri**: nut xem/tai o ca danh sach va trang chi tiet.
- **Noi dung**: theo de xuat mac dinh (thong tin kho, nguoi tao, ly do, doi tac neu co, bang hang, tong tien/CK/thue, ghi chu neu co).
- **Ten file**: `Phieu_Nhap_{date}_{id}` va `Phieu_Xuat_{date}_{id}` (date theo `DDMMYYYY`, lay tu `transactionDate`).
- **Watermark**: hien khi trang thai `CANCELED`.
- **QR**: tro ve trang chu.

## Thiet ke UX / Flow

### Flow 0 - Chon loai (IMPORT/EXPORT)

- Tai man hinh xuat/nhap kho, hien thi loai giao dich (IMPORT/EXPORT).
- Hien thi nut hanh dong theo loai da chon:
  - IMPORT: nut tao/xem/tai PDF phieu nhap.
  - EXPORT: nut tao/xem/tai PDF phieu xuat.

### Flow 1 - Preview tu danh sach

- Moi dong co action "Xem PDF" theo loai phieu.
- Khi click: fetch chi tiet phieu (neu chua co), mo modal preview A4.
- Modal co nut "Tai PDF" va "Dong".
- Loading: hien `Spin` trong modal khi dang fetch.

### Flow 2 - Tai PDF

- Tu danh sach hoac modal: click "Tai PDF".
- Disable nut + hien trang thai dang xu ly.
- Render template A4 offscreen (hidden) de export.
- Export PDF qua `html2pdf.js`, tai ve file theo quy tac dat ten.

## Thiet ke Data Model

### Muc tieu

- Khong doi schema DB.

### De xuat schema

- Khong thay doi.

### Tuong thich & Migration

- Khong can migration.

## Thiet ke ky thuat / Kien truc

### Template A4 cho phieu nhap/xuat

- Tao component chung (vi du `InventoryTransactionA4`) tuong tu `InvoiceA4`.
- Ho tro:
  - Header (logo + tieu de: PHIEU NHAP KHO / PHIEU XUAT KHO).
  - Thong tin chung: kho, ngay, nguoi tao, ly do.
  - Doi tac: supplier (IMPORT) hoac thong tin sale (EXPORT), nguoi giao (IMPORT).
  - Bang hang: ma/ten SP, don vi, so luong, don gia, thanh tien.
  - Tong tien/CK/thue/total sau thue.
  - QR code: link trang chu (lay tu `FRONTEND_URL` hoac `window.location.origin`).
  - Watermark "DA HUY - CANCELED" khi `status === CANCELED`.

### Export PDF

- Reuse util export dang co, tao util moi (vi du `export_inventory_pdf.ts`) su dung `html2pdf.js` giong [ware-house-fe/src/pages/app/sales/utils/export_invoice_pdf.ts](ware-house-fe/src/pages/app/sales/utils/export_invoice_pdf.ts).
- Set A4, scale 3, pagebreak CSS (trong CSS cua template).

### Fetch detail

- Dung `GET /inventory/:id` de lay full thong tin (da populate).
- Cache bang React Query key moi (vi du `inventory.detail`).
- Chinh sua query key list tu `QueryKeys.category.list` sang `QueryKeys.inventory.list` de tranh collision.

## Cac thay doi du kien trong code

- [ware-house-fe/src/constants/query-keys.ts](ware-house-fe/src/constants/query-keys.ts): them key cho detail (neu chua co).
- [ware-house-fe/src/pages/app/warehouse_import_export/index.tsx](ware-house-fe/src/pages/app/warehouse_import_export/index.tsx):
  - Them hien thi loai IMPORT/EXPORT va nut hanh dong theo loai.
  - Them action preview + download.
  - Doi query key list sang `inventory.list`.
  - Hook fetch detail va modal preview.
  - Disable/spinner cho export.
- [ware-house-fe/src/pages/app/warehouse_import_export/detail/index.tsx](ware-house-fe/src/pages/app/warehouse_import_export/detail/index.tsx):
  - Them nut "Xem PDF" / "Tai PDF".
  - Reuse template A4 + export util.
- (Moi) `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.tsx`:
  - Component A4 cho phieu nhap/xuat.
- (Moi) `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.css`:
  - CSS A4 + page-break (giong pattern invoice).
- (Moi) `ware-house-fe/src/pages/app/warehouse_import_export/utils/export_inventory_pdf.ts`:
  - Util export PDF.

## Logging & Bao mat

- Khong log du lieu nhay cam trong QR.
- Endpoint detail van yeu cau auth (Bearer). Khong co endpoint public.

## Rui ro / Edge cases

- **Du lieu thieu populate**: fallback text neu supplier/sale null.
- **List dai**: PDF multi-page, dung `page-break-inside: avoid` cho `<tr>`.
- **Nguoi dung click nhieu lan**: disable nut export trong khi dang xu ly.

## Test plan

### Happy paths

- Mo danh sach phieu nhap/xuat -> click "Xem PDF" -> modal hien dung thong tin.
- Tai PDF tu modal -> file tai ve dung ten.
- Tai PDF tu list -> file tai ve dung ten.

### Edge cases

- Phieu `CANCELED` -> watermark hien trong preview va PDF.
- Phieu khong co supplier/sale -> hien "-".
- Danh sach items dai -> PDF co nhieu trang va khong cat ngang dong.

### Regression

- Cac thao tac tao/duyet/huỷ phieu khong bi anh huong.
- Route permission khong thay doi.

## Nhung diem de thay doi trong tuong lai

- **Ten file**: doi quy tac dat ten trong util export.
- **QR content**: doi link trong `inventory_a4.tsx`.

## Noi nen tach module/ham

- `InventoryA4`: de reuse giua preview va export.
- `exportInventoryPdf(...)`: dung chung cho list va detail.
