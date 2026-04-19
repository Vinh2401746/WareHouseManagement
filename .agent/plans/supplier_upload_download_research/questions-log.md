# Supplier Upload/Download — Questions & Answers

## Confirmed decisions (2026-04-19)

1) File format
- **Decision**: Excel `.xlsx` (same as Product).

2) Template columns
- **Decision**: 4 columns only: **Tên**, **SĐT**, **Email**, **Địa chỉ**.
- **No schema changes** (no Supplier code field).

3) Duplicate handling
- **Decision**: Upsert strategy:
  - Match by **SĐT** if present
  - else match by **Email** if present
  - else match by **Tên**

4) Import strategy
- **Decision**: Partial success allowed.
- Response returns `{ imported, updated, errors }` (like Product).

5) UI placement
- **Decision**: Buttons placed directly on Supplier list page (similar to Product page).
