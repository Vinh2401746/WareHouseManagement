# Warehouse Management AI Coding Instructions

## Architecture Overview

**Stack**: Node.js + Express (BE), React 19 + TypeScript (FE), MongoDB, JWT auth

**Structure**: 
- `BE/` - Express API server with MongoDB
- `ware-house-fe/` - React frontend (Vite + TypeScript)

### Backend Architecture Pattern

The BE follows a strict **3-layer service architecture**:

1. **Routes** (`src/routes/v1/`) - Define endpoints with auth & validation
   - Example: [product.route.js](../BE/src/routes/v1/product.route.js) - routes define middleware chain
   
2. **Controllers** (`src/controllers/`) - HTTP request handlers, wrapped with `catchAsync()`
   - Always wrap in `catchAsync()` to auto-forward errors
   - Use `pick()` to extract query/body fields, `ApiError` to throw errors
   - Example: [product.controller.js](../BE/src/controllers/product.controller.js)

3. **Services** (`src/services/`) - Business logic, database queries
   - All async CRUD operations live here
   - Throw `ApiError` for domain errors (not found, validation, etc.)
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

**Adding a new resource** (e.g., Category):
1. Create model: [models/category.model.js](../BE/src/models/category.model.js)
2. Create service: [services/category.service.js](../BE/src/services/category.service.js) - CRUD operations
3. Create controller: [controllers/category.controller.js](../BE/src/controllers/category.controller.js) - wrap service calls with `catchAsync()`
4. Create validation: [validations/category.validation.js](../BE/src/validations/category.validation.js) - Joi schemas for each endpoint
5. Create route: [routes/v1/category.route.js](../BE/src/routes/v1/category.route.js) - mount in [routes/v1/index.js](../BE/src/routes/v1/index.js)
6. Add permissions to [config/roles.js](../BE/src/config/roles.js)

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
