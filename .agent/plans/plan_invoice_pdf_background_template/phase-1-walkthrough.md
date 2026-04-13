# Phase 1 Walkthrough: Dong bo bo cuc PDF theo mau

**Plan:** PLAN_INVOICE_PDF_BACKGROUND_TEMPLATE
**Ngay trien khai:** 2026-04-13
**Trang thai:** ✅ Hoan thanh

---

## Cong viec da thuc hien

### Task 1: Chuyen mau PDF sang Markdown
- [x] Trich xuat text tu invoice_0312303803-999_ymof0q.pdf va luu Markdown

### Task 2: Cap nhat bo cuc PDF theo mau
- [x] Export anh nen invoice_bg qua Images index (Option B)
- [x] Cap nhat InvoiceA4 bo cuc hoa don GTGT (header, thong tin nguoi mua, bang hang, thue, chu ky)
- [x] Cap nhat InventoryA4 bo cuc phieu nhap/xuat theo mau (header, bang hang, thue, chu ky)

Files changed: `ware-house-fe/src/assets/images/index.ts`, `ware-house-fe/src/pages/app/sales/components/invoice_a4.tsx`, `ware-house-fe/src/pages/app/sales/components/invoice_a4.css`, `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.tsx`, `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.css`, `ware-house-fe/src/utils/numberToWords.ts`

---

## Huong dan Manual Test

### Preconditions
- Co du lieu hoa don va phieu nhap/xuat kho de preview/export PDF.

### Test Steps
1. Mo man hoa don, chon "Xem truoc" va "Tai PDF".
2. Mo man phieu nhap/xuat kho, chon "Xem truoc" va "Tai PDF".

### Expected Results
- Mau A4 co nen invoice_bg, bo cuc giong file mau.
- Hoa don co cac khoi: thong tin nguoi mua, bang hang, tong hop thue, chu ky.
- Phieu nhap/xuat kho co bo cuc tuong tu.
- Khong bi trang trang them khi xuat PDF.

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `ware-house-fe/src/assets/images/index.ts` | Modified | Export invoice_bg qua Images |
| `ware-house-fe/src/pages/app/sales/components/invoice_a4.tsx` | Modified | Dong bo bo cuc hoa don theo mau |
| `ware-house-fe/src/pages/app/sales/components/invoice_a4.css` | Modified | Them style layout + nen |
| `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.tsx` | Modified | Dong bo bo cuc phieu kho theo mau |
| `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.css` | Modified | Them style layout + nen |
| `ware-house-fe/src/utils/numberToWords.ts` | Created | Doi so thanh chu tieng Viet |

---

## Next Phase Dependencies

- Phase 2 phu thuoc vao: cap nhat BE tra ve thong tin phieu xuat kho cho hoa don.
- Can user confirm: Co
