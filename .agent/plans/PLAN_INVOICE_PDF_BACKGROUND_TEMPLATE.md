# PLAN: Invoice/Inventory PDF Background + Template Structure

## Muc tieu

- Dong bo mau PDF hoa don va phieu nhap/xuat theo bo cuc tu file mau invoice_0312303803-999_ymof0q.pdf.
- Ap dung anh nen invoice_bg.jpg cho ca hoa don va phieu nhap/xuat.
- Dam bao xuat PDF khong bi trang trang (A4) va van de doc.

## Non-goals (chua lam o phase nay)

- Thay doi quy trinh xuat PDF (logic export, html2pdf) ngoai nhung dieu can thiet de ho tro background.
- Thiet ke lai UI man hinh danh sach/chi tiet ngoai pham vi PDF.

## Boi canh hien trang

- Hoa don dang render qua component InvoiceA4 va export qua exportInvoicePdf.
- Phieu nhap/xuat kho dang render qua component InventoryA4 va export qua exportInventoryPdf.
- Mau A4 dang set width/height 210mm/297mm va margin 0.

## Yeu cau nghiep vu (da chot)

- **Cau truc PDF**: header (thong tin nha cung cap hoa don + so/ky hieu hoa don + logo), body (thong tin hoa don, thong tin phieu xuat kho, bang hang hoa), phan chi phi va thue, cuoi cung la thong tin phan mem.
- **Background**: dung invoice_bg.jpg lam anh nen cho ca hoa don va phieu nhap/xuat kho.
- **Ky hieu hoa don**: lay tu truong `code` cua sale va phieu nhap/xuat kho.
- **So hoa don**: tam thoi chua can hien thi.
- **So hoa don trong tuong lai**: neu can them, se dung truong `no`.
- **Thong tin phan mem**: "Phan mem quan ly kho ban hang", "Cong ty co phan Thien Trieu", "SDT: 0988666789", "Email: group7@gmail.com", "Website: quanlykho.sanghh.space". Cac truong khac (VD: STK ngan hang) co the dien gia dinh phu hop.
- **Do dam/opacity background**: danh gia theo file mau; neu khong danh gia duoc thi dung de xuat 0.12-0.18.
- **Ngon ngu hien thi**: Tat ca noi dung text hien thi bang tieng Viet co dau, tru cac truong du lieu ky thuat (email, so dien thoai, ma hoa don, ky hieu, so hoa don).
- **Thong tin nha cung cap hoa don**: dung thong tin cong ty co dinh da cung cap; thong tin cua hang (branch) se import va hien thi chung o header.

## Yeu cau can confirm

- (Khong con) Truong du lieu nao la "so" va "ky hieu" hoa don trong sale detail.
- (Khong con) Vi tri thong tin phan mem (dat o footer ben trai QR).
- (Khong con) Nguon thong tin nha cung cap hoa don (dung thong tin cong ty co dinh).

## Thiet ke UX / Flow

### Flow xuat hoa don PDF

- User bam tai PDF tren man hoa don.
- He thong load sale detail, render InvoiceA4 offscreen, export PDF.
- PDF co bo cuc theo mau va nen invoice_bg.jpg.

### Flow xuat phieu nhap/xuat PDF

- User bam tai PDF tren danh sach/chi tiet nhap xuat.
- He thong load transaction detail, render InventoryA4 offscreen, export PDF.
- PDF co bo cuc tuong tu (header/body/totals/footer) va nen invoice_bg.jpg.

## Thiet ke Data Model

### Muc tieu

- Bao toan API hien co; bo sung chi khi can thong tin phieu xuat kho cho hoa don.

### De xuat schema

- Neu sale detail chua co thong tin phieu xuat kho, cap nhat BE sale detail response de include ma phieu xuat, ngay, kho.

### Tuong thich & Migration

- Khong can migration DB.
- Thay doi response co the chi them fields moi (backward compatible).

## Thiet ke ky thuat / Kien truc

### Background image

- Them asset invoice_bg.jpg vao assets/images va import tu component.
- Option B: export invoice_bg.jpg tu assets/images/index.ts va import tu Images.
- Ap dung anh nen qua CSS variable/inline style, de tranh loi duong dan khi build.
- Dung pseudo-element ::before de dieu chinh opacity ma khong anh huong text.

### Bo cuc template

- Refactor layout InvoiceA4 va InventoryA4 de co cac khoi ro rang (header/body/totals/footer).
- Dat ten class ro rang, su dung flex/grid giong pattern hien tai.
- Them block thong tin phan mem o footer ben trai QR.

## Cac thay doi du kien trong code

- ware-house-fe/src/assets/images/index.ts: export them invoice_bg.jpg (neu can dung tu index).
- ware-house-fe/src/pages/app/sales/components/invoice_a4.tsx: them import anh nen; cap nhat bo cuc header/body/chi phi/thue/footer theo mau.
- ware-house-fe/src/pages/app/sales/components/invoice_a4.css: them style cho background va cac khoi bo cuc moi.
- ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.tsx: them import anh nen; cap nhat bo cuc tuong tu (header/body/totals/footer).
- ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.css: them style cho background va bo cuc moi.
- BE/src/services/sale.service.js (neu can): bo sung du lieu phieu xuat kho trong sale detail response.

## Logging & Bao mat

- Khong log thong tin nhay cam vao client.
- Neu them field moi o BE, chi tra ve thong tin can thiet cho PDF.

## Rui ro / Edge cases

- **Anh nen lam toi chu**: giam opacity hoac dung overlay trang mo de dam bao doc.
- **Sale detail thieu truong so/ky hieu**: hien thi fallback "-" va ghi can confirm mapping.
- **Khac nhau giua hoa don va phieu nhap/xuat**: can map dung thong tin (khong dung nham supplier/customer).

## Test plan

### Happy paths

- Xuat PDF hoa don: background hien thi, bo cuc dung thu tu khoi, khong trang trang.
- Xuat PDF phieu nhap kho va phieu xuat kho: background hien thi, thong tin dung, khong trang trang.

### Edge cases

- Hoa don khong co khach hang/so dien thoai/dia chi: hien "-" hoac rong, bo cuc khong vo.
- Phieu nhap/xuat khong co supplier/nguoi giao: hien "-".

### Regression

- Tinh nang xem truoc PDF van hoat dong.
- Table hang hoa khong bi trang trang nguoi dung.

## Nhung diem de thay doi trong tuong lai

- Doi anh nen bang file moi trong assets.
- Dieu chinh opacity va vi tri background qua CSS variable.

## Noi nen tach module/ham

- buildInvoiceHeaderData(): gom map du lieu header (so/ky hieu, nha cung cap, logo).
- buildInvoiceFooterData(): gom thong tin phan mem/qr.
