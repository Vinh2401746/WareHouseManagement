# Supplier Upload/Download — Codebase Analysis

## Existing backend patterns

### Product Excel import/export pattern (reference implementation)
- `BE/src/routes/v1/product.route.js`
  - `GET /product/import-template`
  - `POST /product/import` (multipart `file`, uses `upload.single('file')`)
  - `GET /product/export`
- `BE/src/middlewares/upload.js`
  - Multer `memoryStorage`, allows Excel mime types, 5MB limit.
- `BE/src/controllers/product.controller.js`
  - Sets `Content-Type` for xlsx and `Content-Disposition` for attachment.
  - Import returns `{ imported, updated, errors }` and continues on row errors.
- `BE/src/services/product.service.js`
  - Uses `exceljs` to generate template and parse uploads.
  - Validates headers.
  - Row-by-row validation; collects `errors` with `{ row, code, errors[] }`.

### Supplier current state
- `BE/src/routes/v1/supplier.route.js`: CRUD only.
- `BE/src/controllers/supplier.controller.js`: CRUD only.
- `BE/src/services/supplier.service.js`: CRUD only.
- `BE/src/models/supplier.model.js`: fields: `name (required)`, `phone`, `email`, `address`.

### RBAC keys available
- Existing permissions in `BE/src/constants/permission.constant.js`:
  - `getSuppliers`
  - `manageSuppliers`
- Existing roles include supplier permissions already in `BE/src/config/roles.js`.

## Existing frontend patterns

### Product import/export UI pattern
- `ware-house-fe/src/pages/app/products/index.tsx`
  - Buttons: download template, import, export.
  - Uses `useMutation` with `responseType: 'blob'` for downloads.
  - Import uses `<input type=file>` and posts `FormData`.
  - Error UX: toast only first row error.
- `ware-house-fe/src/api/products/index.ts`
  - `getTemplateProduct()` → GET blob
  - `importTemplateProduct(file)` → POST multipart
  - `exportCurrentExProduct()` → GET blob

### Supplier current state
- `ware-house-fe/src/pages/app/suppiler/index.tsx`: list + create/update modal + delete.
- `ware-house-fe/src/api/supplier/index.ts`: CRUD only.

## Gaps for Supplier upload/download
- Need new BE endpoints mirroring Product:
  - `GET /supplier/import-template`
  - `POST /supplier/import`
  - `GET /supplier/export`
- Need FE API methods + UI buttons on Supplier page.
- Need clear duplicate key strategy (Supplier has no `code` field).
