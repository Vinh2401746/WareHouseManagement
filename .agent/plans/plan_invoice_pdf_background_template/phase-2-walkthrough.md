# Phase 2 Walkthrough: Bo sung thong tin phieu xuat kho trong sale detail

**Plan:** PLAN_INVOICE_PDF_BACKGROUND_TEMPLATE
**Ngay trien khai:** 2026-04-14
**Trang thai:** ✅ Hoan thanh

---

## Cong viec da thuc hien

### Task 1: Them exportTransaction vao sale detail
- [x] Truy van InventoryTransaction theo saleId
- [x] Gan exportTransaction vao response sale detail

Files changed: `BE/src/services/sale.service.js`

---

## Huong dan Manual Test

### Preconditions
- Co hoa don da tao va co phieu xuat kho lien ket.

### Test Steps
1. Goi API GET /sale/{saleId}.
2. Kiem tra field exportTransaction tra ve.

### Expected Results
- exportTransaction co code, transactionDate, warehouse.name, status.

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `BE/src/services/sale.service.js` | Modified | Bo sung exportTransaction cho sale detail |

---

## Next Phase Dependencies

- Khong con phase tiep theo.
- Can user confirm: Co
