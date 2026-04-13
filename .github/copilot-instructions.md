# Warehouse Management (WMS) – Copilot Workspace Instructions

Use these instructions as the *bootstrap* for working effectively in this repo.

## Project Layout

This workspace contains two separate Node projects (no root-level app runner):

- `BE/` – Express + MongoDB REST API
- `ware-house-fe/` – React 19 + Vite frontend

When in doubt, make changes inside `BE/` or `ware-house-fe/` only.

## Quick Commands

Backend (from `BE/package.json`):

```bash
cd BE
npm install
cp .env.example .env
npm run seed:rbac
npm run dev
```

Frontend (from `ware-house-fe/package.json`):

```bash
cd ware-house-fe
npm install
npm run dev
```

Testing/linting (backend):

```bash
cd BE
npm test
npm run lint
npm run prettier:fix
```

## Backend Architecture Pattern (BE)

The BE follows a strict **route → controller → service** architecture:

1. **Routes** (`src/routes/v1/`) – Define endpoints with auth + validation middleware
   - Example: [product.route.js](../BE/src/routes/v1/product.route.js)
   
2. **Controllers** (`src/controllers/`) – HTTP handlers
   - Always wrap in `catchAsync()` to auto-forward errors
   - Use `pick()` to extract allowed query/body fields
   - Throw `ApiError(httpStatus.CODE, message)` for expected errors
   - Example: [product.controller.js](../BE/src/controllers/product.controller.js)

3. **Services** (`src/services/`) – Business logic + DB queries (no separate repository layer)
   - All async CRUD operations live here
   - Check existence before update/delete; throw `ApiError` on not found / invalid domain state
   - Example: [product.service.js](../BE/src/services/product.service.js)

**Data flow**: Route → validate middleware → controller → service → response

### Key Patterns

**Error Handling**: Use custom `ApiError(httpStatus.CODE, message)`:
```javascript
// In service
const product = await Product.findById(id);
if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');

// In middleware - auto-converted to standardized JSON response
```

**Input Validation**: Define Joi schemas in `src/validations/`, apply in routes:
```javascript
// Route applies validation middleware
router.post('/', validate(productValidation.createProduct), productController.createProduct)
// Joi with Vietnamese error messages - see [product.validation.js](../BE/src/validations/product.validation.js)
```

**Authentication**: JWT via Passport, role-based access control in routes:
```javascript
router.get('/', auth('getProducts'), validate(...), controller)  // checks user.role in roleRights
```
**Role Rights**: Define in [config/roles.js](../BE/src/config/roles.js) - maps roles to permission arrays

**Pagination & Filtering**: Mongoose plugin at [src/models/plugins/paginate.plugin.js](../BE/src/models/plugins/paginate.plugin.js):
```javascript
const products = await Product.paginate(filter, { page, limit, sortBy });
```

**Branch scoping / multi-tenant isolation**:
- Prefer using existing scoping helpers instead of hand-rolling branch filters.
- See: [branchScope.js](../BE/src/utils/branchScope.js)

**Uploads & static URLs**:
- Upload base config: [config.js](../BE/src/config/config.js)
- Product uploads: `BE/uploads/products/`

**Model Schema Plugins**: Auto-apply in models:
- `toJSON` - serialization plugin
- `paginate` - pagination plugin

## Development Workflows

**Local Setup**:
```bash
cd BE
npm install
cp .env.example .env      # configure MONGODB_URL, JWT_SECRET, etc.
npm run dev               # nodemon watches src/
```

**Testing**: 
```bash
npm test                  # jest with coverage
npm run test:watch       # watch mode
```

**Docker**: `npm run docker:dev` (compose spins up API + MongoDB)

**Linting & Format**:
```bash
npm run lint             # eslint
npm run lint:fix         # fix violations
npm run prettier:fix     # format code
```

**Frontend**:
```bash
cd ware-house-fe
npm install
npm run dev              # Vite dev server
npm run build            # production build
```

## Frontend Stack

- **HTTP Client**: Axios with token interceptor (Bearer in auth header)
- **State**: Redux Toolkit + Redux Persist (token/user storage)
- **UI**: Ant Design 6 + custom styling
- **Routing**: React Router v7
- **Query**: TanStack React Query for async data
- **Notifications**: React Toastify

**API Integration**: [src/api/](../ware-house-fe/src/api/) - each resource has dedicated API module

## Common Pitfalls

- RBAC must be seeded before testing auth/permissions: `cd BE && npm run seed:rbac` (see [seedRbac.js](../BE/scripts/seeds/seedRbac.js)).
- Backend lint/parser quirk: if you hit parsing errors around nullish coalescing, avoid `??` and use a ternary fallback.
- Windows FE install issue (Rollup optional native module missing): delete `ware-house-fe/node_modules` and `ware-house-fe/package-lock.json`, then rerun `npm install`.
- FE typecheck: consider running `npx tsc -p ware-house-fe/tsconfig.json --noEmit` (Vite build may not catch all TS errors).

## Where To Look (Examples)

- Route/controller/service example: [product.route.js](../BE/src/routes/v1/product.route.js), [product.controller.js](../BE/src/controllers/product.controller.js), [product.service.js](../BE/src/services/product.service.js)
- Auth & role rights: [auth middleware](../BE/src/middlewares/auth.js), [roles config](../BE/src/config/roles.js), [permission constants](../BE/src/constants/permission.constant.js)

## Additional Documentation (Link, Don’t Duplicate)

- User manual: [USER_MANUAL.md](../.agent/docs/USER_MANUAL.md)
- Feature specs (BA): see `/.agent/docs/feature_*_spec.md`
- Agent profiles (optional): `/.github/agents/*.md`
- Scoped Copilot instructions (applyTo): `/.github/instructions/*.instructions.md`

## Critical Files & Conventions

### Models
- **Location**: [BE/src/models/](../BE/src/models/)
- **Patterns**: Mongoose schemas with `timestamps`, plugins applied, use `ref` for relations
- **Custom Plugins**: [src/models/plugins/](../BE/src/models/plugins/)

### Database Features
- Timestamps auto-added (`createdAt`, `updatedAt`)
- Reference fields use Mongoose ObjectId with `ref` for population
- Example: Product references Category - service calls `.populate('category')`

### Authentication
- **Token Types**: ACCESS (short 30m), REFRESH (30d), RESET_PASSWORD (10m), VERIFY_EMAIL (10m)
- **Config**: [config/tokens.js](../BE/src/config/tokens.js)
- **Strategy**: [config/passport.js](../BE/src/config/passport.js)

### Environment Variables
**Required** (.env):
- `NODE_ENV`, `PORT`, `MONGODB_URL`
- `JWT_SECRET`, `JWT_*_EXPIRATION_*`
- SMTP config for email (optional)
- `FRONTEND_URL` for email links

See [config.js](../BE/src/config/config.js) for schema with Joi validation

## Common Task Patterns

**Adding a new resource** (example pattern – see `Unit`):
1. Model: [unit.model.js](../BE/src/models/unit.model.js)
2. Service: [unit.service.js](../BE/src/services/unit.service.js)
3. Controller: [unit.controller.js](../BE/src/controllers/unit.controller.js)
4. Validation: [unit.validation.js](../BE/src/validations/unit.validation.js)
5. Route: [unit.route.js](../BE/src/routes/v1/unit.route.js) (mounted via [v1/index.js](../BE/src/routes/v1/index.js))
6. RBAC rights: update [roles.js](../BE/src/config/roles.js) + permission constants if needed

**Modifying validation rules**:
- Edit corresponding file in [validations/](../BE/src/validations/) 
- Use `Joi.custom(objectId)` for MongoDB IDs
- Add Vietnamese `.messages()` for localization

**Testing**: Jest tests in [tests/](../BE/tests/) mirror source structure (unit, integration, fixtures)

## Key Dependencies

**Backend**:
- `express`, `mongoose`, `passport-jwt` (auth)
- `joi` (validation), `http-status` (constants)
- `winston` (logging), `morgan` (HTTP logger)
- `nodemailer` (email)

**Frontend**:
- `axios` (HTTP), `@reduxjs/toolkit` (state)
- `antd` (UI), `react-router-dom` (routing)
- `@tanstack/react-query` (async state)

## Code Quality Standards

- Use `catchAsync()` wrapper in all controllers
- Never throw plain Errors - use `ApiError(httpStatus.CODE, message)`
- Always check resource existence before operations
- Apply `validate()` middleware to all data-accepting routes
- Populate referenced fields in service layer
- Test coverage targets: functions, error cases, edge cases
