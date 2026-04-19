const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const { Supplier } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');

const SUPPLIER_EXCEL_HEADERS = ['Tên', 'SĐT', 'Email', 'Địa chỉ'];

/**
 * Create a supplier
 * @param {Object} supplierBody
 * @returns {Promise<Supplier>}
 */
const createSupplier = async (supplierBody) => {
  const supplier = await Supplier.create(supplierBody);
  return supplier;
};

/**
 * Query for suppliers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySuppliers = async (filter, options) => {
  const suppliers = await Supplier.paginate(filter, options);
  return suppliers;
};

/**
 * Get supplier by id
 * @param {ObjectId} id
 * @returns {Promise<Supplier>}
 */
const getSupplierById = async (id) => {
  return Supplier.findById(id);
};

/**
 * Update supplier by id
 * @param {ObjectId} supplierId
 * @param {Object} updateBody
 * @returns {Promise<Supplier>}
 */
const updateSupplierById = async (supplierId, updateBody) => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.supplier.notFound);
  }
  Object.assign(supplier, updateBody);
  await supplier.save();
  return supplier;
};

/**
 * Delete supplier by id
 * @param {ObjectId} supplierId
 * @returns {Promise<Supplier>}
 */
const deleteSupplierById = async (supplierId) => {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.supplier.notFound);
  }
  await supplier.remove();
  return supplier;
};

/**
 * Generate Supplier import template (Excel .xlsx) as buffer.
 *
 * @returns {Promise<Buffer>}
 */
const getSupplierImportTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WareHouseManagement';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Nhà cung cấp');

  worksheet.columns = [
    { header: 'Tên', key: 'name', width: 30 },
    { header: 'SĐT', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Địa chỉ', key: 'address', width: 35 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2F75B6' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 22;

  // Sample rows
  const sampleRows = [
    ['Nhà cung cấp ABC', '0987654321', 'supplier@abc.com', 'Hà Nội'],
    ['Nhà cung cấp XYZ', '0909123456', 'contact@xyz.com', 'TP. Hồ Chí Minh'],
  ];
  sampleRows.forEach((r) => {
    const row = worksheet.addRow(r);
    row.font = { italic: true, color: { argb: 'FF666666' } };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' },
    };
  });

  const noteRow = worksheet.addRow(['* Xóa các dòng mẫu trên trước khi nhập', '', '', '']);
  noteRow.font = { color: { argb: 'FFCC0000' }, italic: true, size: 9 };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Import suppliers from an Excel file buffer (xlsx).
 * Upsert rule:
 * - If phone exists -> match by phone
 * - Else if email exists -> match by email
 * - Else -> match by name
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ imported: number, updated: number, errors: Array }>}
 */
const importSuppliersFromExcel = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.supplier.excel.invalidFile);
  }

  const headerRow = worksheet.getRow(1);
  const actualHeaders = [];
  headerRow.eachCell((cell) => {
    actualHeaders.push(String(cell.value || '').trim());
  });

  const missingHeaders = SUPPLIER_EXCEL_HEADERS.filter((h) => !actualHeaders.includes(h));
  if (missingHeaders.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `File Excel thiếu cột: ${missingHeaders.join(', ')}. Cần có: ${SUPPLIER_EXCEL_HEADERS.join(', ')}`
    );
  }

  const headerIndex = {};
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || '').trim();
    headerIndex[val] = colNumber;
  });

  const totalRows = worksheet.rowCount;
  if (totalRows < 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.supplier.excel.noData);
  }

  const isValidEmailBasic = (email) => {
    // MVP: basic validation only
    return /.+@.+\..+/.test(String(email));
  };

  const getCellValue = (row, header) => {
    const colIdx = headerIndex[header];
    if (!colIdx) return null;
    const cell = row.getCell(colIdx);
    const val = cell.value;
    if (val === null || val === undefined || val === '') return null;
    return String(val).trim();
  };

  let imported = 0;
  let updated = 0;
  const errors = [];

  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);

    const name = getCellValue(row, 'Tên');
    const phone = getCellValue(row, 'SĐT');
    const email = getCellValue(row, 'Email');
    const address = getCellValue(row, 'Địa chỉ');

    // Skip completely empty rows
    if (!name && !phone && !email && !address) continue;

    const rowErrors = [];
    if (!name) rowErrors.push('Thiếu Tên');
    if (email && !isValidEmailBasic(email)) rowErrors.push('Email không hợp lệ');

    const key = phone || email || name || '';

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, key, errors: rowErrors });
      continue;
    }

    try {
      let query = null;
      if (phone) query = { phone };
      else if (email) query = { email };
      else query = { name };

      const existingSupplier = await Supplier.findOne(query);
      if (existingSupplier) {
        existingSupplier.name = name;
        if (phone !== null) existingSupplier.phone = phone;
        if (email !== null) existingSupplier.email = email;
        if (address !== null) existingSupplier.address = address;
        await existingSupplier.save();
        updated += 1;
      } else {
        const supplierData = { name };
        if (phone !== null) supplierData.phone = phone;
        if (email !== null) supplierData.email = email;
        if (address !== null) supplierData.address = address;
        await Supplier.create(supplierData);
        imported += 1;
      }
    } catch (err) {
      errors.push({ row: rowNumber, key, errors: [err.message] });
    }
  }

  return { imported, updated, errors };
};

/**
 * Export suppliers to an Excel workbook buffer.
 *
 * @param {Object} filter
 * @returns {Promise<Buffer>}
 */
const exportSuppliersToExcel = async (filter = {}) => {
  const suppliers = await Supplier.find(filter).lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WareHouseManagement';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Nhà cung cấp');

  worksheet.columns = [
    { header: 'Tên', key: 'name', width: 30 },
    { header: 'SĐT', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Địa chỉ', key: 'address', width: 35 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2F75B6' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 22;

  suppliers.forEach((supplier) => {
    worksheet.addRow({
      name: supplier.name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  createSupplier,
  querySuppliers,
  getSupplierById,
  updateSupplierById,
  deleteSupplierById,
  getSupplierImportTemplate,
  importSuppliersFromExcel,
  exportSuppliersToExcel,
};
