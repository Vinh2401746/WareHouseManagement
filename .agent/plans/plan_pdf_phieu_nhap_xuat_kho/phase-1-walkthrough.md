# Phase 1 Walkthrough: Frontend - Preview + Export PDF

**Plan:** PLAN_PDF_PHIEU_NHAP_XUAT_KHO
**Ngay trien khai:** 2026-04-13
**Trang thai:** ✅ Hoan thanh

---

## Cong viec da thuc hien

### Task 1: Tao template A4 + util export
- [x] Them component `InventoryA4` cho phieu nhap/xuat
- [x] Them CSS A4 + page break
- [x] Them util `exportInventoryPdf`
- Files changed: `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.tsx`, `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.css`, `ware-house-fe/src/pages/app/warehouse_import_export/utils/export_inventory_pdf.ts`

### Task 2: Cap nhat query keys va trang danh sach
- [x] Them `QueryKeys.inventory.detail`
- [x] Doi query key list sang `inventory.list`
- [x] Them chon loai IMPORT/EXPORT va action xem/tai PDF
- Files changed: `ware-house-fe/src/constants/query-keys.ts`, `ware-house-fe/src/pages/app/warehouse_import_export/index.tsx`

### Task 3: Cap nhat trang chi tiet
- [x] Them nut Xem PDF / Tai PDF
- [x] Them modal preview va export hidden DOM
- Files changed: `ware-house-fe/src/pages/app/warehouse_import_export/detail/index.tsx`

---

## Risks/Issues phat hien

| Issue | Muc do | Mo ta | Trang thai |
|-------|--------|-------|------------|
| Khong co UI tao phieu xuat | Medium | Trang detail hien thoi dang phuc vu nhap kho, nut tao xuat chua co flow rieng | ⏳ Chua cover |

---

## Huong dan Manual Test

### Preconditions
- Co du lieu phieu nhap va phieu xuat trong DB
- User co quyen `inventoryTransactions`

### Test Steps
1. Mo man hinh Xuat/Nhap kho, chon loai "Nhap kho".
2. Click "Xem PDF" tren 1 dong -> modal hien A4.
3. Click "Tai PDF" trong modal -> file tai ve dung ten `Phieu_Nhap_DDMMYYYY_id.pdf`.
4. Chon loai "Xuat kho" -> danh sach filter theo EXPORT.
5. Click "Tai PDF" tren 1 dong -> file tai ve dung ten `Phieu_Xuat_DDMMYYYY_id.pdf`.

### Expected Results
- Modal preview hien dung thong tin, co watermark neu CANCELED.
- PDF tai ve dung ten, layout A4 khong vo.

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.tsx` | Created | Template A4 cho phieu nhap/xuat |
| `ware-house-fe/src/pages/app/warehouse_import_export/components/inventory_a4.css` | Created | CSS A4 + page break |
| `ware-house-fe/src/pages/app/warehouse_import_export/utils/export_inventory_pdf.ts` | Created | Export PDF util |
| `ware-house-fe/src/constants/query-keys.ts` | Modified | Them `inventory.detail` |
| `ware-house-fe/src/pages/app/warehouse_import_export/index.tsx` | Modified | Filter loai + preview/download |
| `ware-house-fe/src/pages/app/warehouse_import_export/detail/index.tsx` | Modified | Preview/download o detail |

---

## Next Phase Dependencies

- Phase 2 phu thuoc vao: khong
- Can user confirm: co
