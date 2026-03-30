const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { Product, Unit } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const config = require('../config/config');
const logger = require('../config/logger');
const { applyBranchScope } = require('../utils/branchScope');

const normalizeRelativeImagePath = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  const normalized = path.posix.normalize(imagePath.replace(/\\/g, '/'));
  const withoutTraversal = normalized.replace(/^((\.\.)\/+)+/g, '').replace(/^\/+/, '');
  return withoutTraversal || null;
};

const buildImageUrl = (imagePath) => {
  const safeRelativePath = normalizeRelativeImagePath(imagePath);
  if (!safeRelativePath) {
    return null;
  }
  const normalizedPrefix = (config.file.publicPrefix || '').replace(/\/+$/g, '');
  if (!normalizedPrefix) {
    return `/${safeRelativePath}`;
  }
  return `${normalizedPrefix}/${safeRelativePath}`;
};

const resolveAbsoluteImagePath = (imagePath) => {
  const safeRelativePath = normalizeRelativeImagePath(imagePath);
  if (!safeRelativePath) {
    return null;
  }
  return path.join(config.file.uploadDir, safeRelativePath);
};

const removeImageFile = async (imagePath) => {
  const absolutePath = resolveAbsoluteImagePath(imagePath);
  if (!absolutePath) {
    return;
  }
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Không thể xoá file ảnh sản phẩm: ${error.message}`);
    }
  }
};

const formatProductResponse = (productDoc) => {
  if (!productDoc) {
    return null;
  }
  const product = productDoc.toJSON();
  product.imageUrl = buildImageUrl(productDoc.imagePath);
  return product;
};

const getProductDocumentById = (id) => Product.findById(id).populate('unit');

/**
 * Get product by id
 * @param {ObjectId} id
 * @param {Object} [context]
 * @returns {Promise<Product>}
 */
const getProductById = async (id, context) => {
  const product = await getProductDocumentById(id);
  if (product && context && !context.isGlobalRole && context.branch) {
    if (product.branch && product.branch.toString() !== context.branch.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
    }
  }
  return formatProductResponse(product);
};

/**
 * Create a product
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (productBody) => {
  const product = await Product.create(productBody);
  return getProductById(product.id);
};

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProducts = async (filter, options, context = {}) => {
  const scopedFilter = applyBranchScope(filter, context);
  options.populate = 'unit';
  const products = await Product.paginate(scopedFilter, options);
  products.results = products.results.map((result) => formatProductResponse(result));
  return products;
};

/**
 * Update product by id
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @param {Object} [context]
 * @returns {Promise<Product>}
 */
const updateProductById = async (productId, updateBody, context) => {
  const product = await getProductDocumentById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.product.notFound);
  }
  if (context && !context.isGlobalRole && context.branch) {
    if (product.branch && product.branch.toString() !== context.branch.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
    }
  }

  const data = { ...updateBody };
  const previousImagePath = product.imagePath;
  let shouldRemovePreviousImage = false;

  if (Object.prototype.hasOwnProperty.call(data, 'imagePath') && data.imagePath) {
    product.imagePath = data.imagePath;
    shouldRemovePreviousImage = Boolean(previousImagePath) && previousImagePath !== data.imagePath;
    delete data.imagePath;
  }

  if (data.removeImage === true && !updateBody.imagePath) {
    product.imagePath = undefined;
    shouldRemovePreviousImage = Boolean(previousImagePath);
  }
  delete data.removeImage;

  Object.assign(product, data);
  await product.save();

  if (shouldRemovePreviousImage) {
    await removeImageFile(previousImagePath);
  }

  return getProductById(product.id);
};

/**
 * Delete product by id
 * @param {ObjectId} productId
 * @param {Object} [context]
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId, context) => {
  const product = await getProductDocumentById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.product.notFound);
  }
  if (context && !context.isGlobalRole && context.branch) {
    if (product.branch && product.branch.toString() !== context.branch.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, responseMessages.common.forbidden);
    }
  }
  const previousImagePath = product.imagePath;
  await product.remove();
  if (previousImagePath) {
    await removeImageFile(previousImagePath);
  }
  return product;
};

// ─── EXCEL HEADERS ────────────────────────────────────────────────────────────

const EXCEL_HEADERS = ['Mã SP', 'Tên SP', 'Đơn vị', 'Tồn tối thiểu', 'Quy cách'];

/**
 * Generate an Excel import template file for products.
 * Includes styled headers and 2 sample rows so users know what to fill in.
 *
 * @returns {Promise<Buffer>}
 */
const getProductImportTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WareHouseManagement';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Sản phẩm');

  // Define columns with widths
  worksheet.columns = [
    { header: 'Mã SP', key: 'code', width: 20 },
    { header: 'Tên SP', key: 'name', width: 35 },
    { header: 'Đơn vị', key: 'unit', width: 15 },
    { header: 'Tồn tối thiểu', key: 'minStock', width: 16 },
    { header: 'Quy cách', key: 'package', width: 25 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2F75B6' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF1A5690' } },
      left: { style: 'medium', color: { argb: 'FF1A5690' } },
      bottom: { style: 'medium', color: { argb: 'FF1A5690' } },
      right: { style: 'medium', color: { argb: 'FF1A5690' } },
    };
  });

  // Add 2 sample rows
  const sampleRows = [
    { code: 'PRD-001', name: 'Nồi cơm điện Sunhouse', unit: 'Cái', minStock: 10, package: 'Thùng 1 cái' },
    { code: 'PRD-002', name: 'Quạt điện Panasonic', unit: 'Cái', minStock: 5, package: 'Hộp' },
  ];

  sampleRows.forEach((data, idx) => {
    const row = worksheet.addRow(data);
    row.font = { color: { argb: 'FF595959' }, italic: true };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: idx % 2 === 0 ? 'FFFFF9E6' : 'FFFEF3CD' },
    };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
      };
    });
  });

  // Add a note row at the bottom
  const noteRow = worksheet.addRow([
    '* Xóa các dòng mẫu trên trước khi nhập',
    '',
    '* Điền đúng tên Đơn vị có trong hệ thống',
    '* Số nguyên ≥ 0',
    '* Tùy chọn',
  ]);
  noteRow.font = { color: { argb: 'FFCC0000' }, italic: true, size: 9 };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Import products from an Excel file buffer.
 * If a product code already exists → update; otherwise → create.
 *
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Promise<{ imported: number, updated: number, errors: Array }>}
 */
const importProductsFromExcel = async (buffer, context = {}) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.product.excel.invalidFile);
  }

  // Validate header row
  const headerRow = worksheet.getRow(1);
  const actualHeaders = [];
  headerRow.eachCell((cell) => {
    actualHeaders.push(String(cell.value || '').trim());
  });

  const missingHeaders = EXCEL_HEADERS.filter((h) => !actualHeaders.includes(h));
  if (missingHeaders.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `File Excel thiếu cột: ${missingHeaders.join(', ')}. Cần có: ${EXCEL_HEADERS.join(', ')}`
    );
  }

  // Map header name → column index (1-based)
  const headerIndex = {};
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || '').trim();
    headerIndex[val] = colNumber;
  });

  const totalRows = worksheet.rowCount;
  if (totalRows < 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.product.excel.noData);
  }

  // Cache all units for lookup
  const allUnits = await Unit.find({});
  const unitMap = {};
  allUnits.forEach((u) => {
    unitMap[u.name.toLowerCase()] = u;
  });

  let imported = 0;
  let updated = 0;
  const errors = [];

  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);

    const getCellValue = (header) => {
      const colIdx = headerIndex[header];
      if (!colIdx) return null;
      const cell = row.getCell(colIdx);
      const val = cell.value;
      if (val === null || val === undefined || val === '') return null;
      return String(val).trim();
    };

    const code = getCellValue('Mã SP');
    const name = getCellValue('Tên SP');
    const unitName = getCellValue('Đơn vị');
    const minStockRaw = getCellValue('Tồn tối thiểu');
    const packageVal = getCellValue('Quy cách');

    // Skip completely empty rows
    if (!code && !name && !unitName) continue;

    const rowErrors = [];

    if (!code) rowErrors.push('Thiếu Mã SP');
    if (!name) rowErrors.push('Thiếu Tên SP');
    if (!unitName) rowErrors.push('Thiếu Đơn vị');

    const minStock = minStockRaw !== null ? Number(minStockRaw) : 0;
    if (minStockRaw !== null && (Number.isNaN(minStock) || minStock < 0)) {
      rowErrors.push('Tồn tối thiểu phải là số >= 0');
    }

    // Unit lookup
    let unit = null;
    if (unitName) {
      unit = unitMap[unitName.toLowerCase()];
      if (!unit) {
        rowErrors.push(`Đơn vị "${unitName}" không tồn tại trong hệ thống`);
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, code: code || '', errors: rowErrors });
      continue;
    }

    try {
      // Upsert by code
      const existingProduct = await Product.findOne({ code });
      if (existingProduct) {
        existingProduct.name = name;
        existingProduct.unit = unit._id;
        existingProduct.minStock = minStock;
        if (packageVal) existingProduct.package = packageVal;
        await existingProduct.save();
        updated += 1;
      } else {
        const productData = { code, name, unit: unit._id, minStock };
        if (packageVal) productData.package = packageVal;

        if (!context.isGlobalRole && context.branch) {
          productData.branch = context.branch;
        }

        await Product.create(productData);
        imported += 1;
      }
    } catch (err) {
      errors.push({ row: rowNumber, code: code || '', errors: [err.message] });
    }
  }

  return { imported, updated, errors };
};

/**
 * Export products to an Excel workbook buffer.
 *
 * @param {Object} filter - Optional filter (code, name, etc.)
 * @returns {Promise<Buffer>}
 */
const exportProductsToExcel = async (filter = {}, context = {}) => {
  const scopedFilter = applyBranchScope(filter, context);
  const products = await Product.find(scopedFilter).populate('unit').lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WareHouseManagement';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Sản phẩm');

  // Define columns
  worksheet.columns = [
    { header: 'Mã SP', key: 'code', width: 20 },
    { header: 'Tên SP', key: 'name', width: 35 },
    { header: 'Đơn vị', key: 'unit', width: 15 },
    { header: 'Tồn tối thiểu', key: 'minStock', width: 15 },
    { header: 'Quy cách', key: 'package', width: 25 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2F75B6' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 22;

  // Add data rows
  products.forEach((product) => {
    worksheet.addRow({
      code: product.code,
      name: product.name,
      unit: product.unit ? product.unit.name : '',
      minStock: product.minStock,
      package: product.package || '',
    });
  });

  // Style data rows (zebra striping)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
      };
    });
    if (rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F7FB' },
      };
    }
  });

  // Return buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  createProduct,
  queryProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  importProductsFromExcel,
  exportProductsToExcel,
  getProductImportTemplate,
};
