# 📊 BÁO CÁO KIỂM THỬ — Phân hệ Bán hàng (POS)

**Target:** Luồng tạo hóa đơn bán hàng (Create Invoice / POS)
**Ngày test:** 2026-03-30
**Phạm vi:** Full flow — UI + API + Database + Code Review

---

## Tổng quan

| Metrics | Value |
|---------|-------|
| Tổng test cases | 6 |
| ✅ Passed | 3 |
| ❌ Failed | 2 |
| ⚠️ Warning | 1 |
| Pass rate | 50% (trước fix) → **83% (sau fix)** |

---

## 🐛 BUG-001: Branch Mismatch — Không thể tạo hóa đơn bán hàng (P1 - BLOCKER) — ✅ ĐÃ FIX

| Field | Value |
|-------|-------|
| **Severity** | P1 (Blocker) |
| **Category** | API / Logic |
| **Location** | product_invoice_list.tsx dòng 293, 313 |

**Mô tả:**
Khi tạo hóa đơn bán hàng (cả Lưu nháp và Thanh toán), API luôn trả về lỗi 400 - Chi nhánh không khớp với kho xuất.

**Root Cause:**
Frontend hardcode một Branch ID không tồn tại trong DB vào payload:
```javascript
branch: userInfor?.branch?.id || '69bac2279924c4e470fc59f1'  // ID rác
```

BE kiểm tra branch !== warehouseDoc.branch → throw error.

**Cách fix:**
Bỏ hoàn toàn field branch khỏi payload FE. BE đã có sẵn logic tự resolve:
```javascript
const resolvedBranch = branch || warehouseDoc.branch;  // tự lấy từ warehouse
```

**Verification:** ✅ API test trả về 201 Created, branch tự resolve đúng.

---

## 🐛 BUG-002: Giá bán = 0đ cho đa số sản phẩm (P3 - Major) — ⚠️ KNOWN ISSUE (Data)

**Root Cause:** Các sản phẩm chưa được cập nhật sellingPrice. Giá trị mặc định = 0.

**Đề xuất:** Cập nhật giá bán cho tất cả sản phẩm qua UI "Quản lý Sản phẩm".

---

## 🐛 BUG-003: Tồn kho = 0 cho nhiều sản phẩm (P4 - Info) — ⚠️ KNOWN ISSUE (Data)

**Root Cause:** Các sản phẩm chưa được nhập kho (chưa có ProductBatch). Logic tổng hợp tồn kho hoạt động đúng.

---

## ✅ TEST CASES

| TC# | Category | Test Case | Status | Severity |
|-----|----------|-----------|--------|----------|
| TC001 | API | Tạo hóa đơn DRAFT không gửi branch | ✅ PASS | — |
| TC002 | API | BE tự resolve branch từ warehouse | ✅ PASS | — |
| TC003 | UI | Chọn kho → hiển thị sản phẩm đúng | ✅ PASS | — |
| TC004 | API | Tạo hóa đơn COMPLETED (trước fix) | ❌ FAIL → ✅ FIXED | P1 |
| TC005 | UI | Giá bán hiển thị đúng | ⚠️ Data issue | P3 |
| TC006 | UI | Tồn kho hiển thị đúng cho SP có batch | ✅ PASS | — |
