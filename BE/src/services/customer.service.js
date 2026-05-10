const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const { Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { applyBranchScope, extractId } = require('../utils/branchScope');

const CUSTOMER_EXCEL_HEADERS = ['Tên', 'SĐT', 'Email', 'Địa chỉ', 'Ghi chú'];

/**
 * Create a customer
 * @param {Object} customerBody
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const createCustomer = async (customerBody, context = {}) => {
  // If no branch provided, inherit from request context (staff's branch)
  if (!customerBody.branch && context.branch && !context.isGlobalRole) {
    customerBody.branch = context.branch;
  }
  
  if (!customerBody.branch) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.branch.required);
  }

  return Customer.create(customerBody);
};

/**
 * Query for customers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} context - Scope context
 * @returns {Promise<QueryResult>}
 */
const queryCustomers = async (filter, options, context = {}) => {
  const scopedFilter = applyBranchScope(filter, context);
  const customers = await Customer.paginate(scopedFilter, options);
  return customers;
};

/**
 * Get customer by id
 * @param {ObjectId} id
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const getCustomerById = async (id, context = {}) => {
  const scopedFilter = applyBranchScope({ _id: id }, context);
  const customer = await Customer.findOne(scopedFilter);
  return customer;
};

/**
 * Update customer by id
 * @param {ObjectId} customerId
 * @param {Object} updateBody
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const updateCustomerById = async (customerId, updateBody, context = {}) => {
  const customer = await getCustomerById(customerId, context);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.customer.notFound);
  }

  Object.assign(customer, updateBody);
  await customer.save();
  return customer;
};

/**
 * Delete customer by id
 * @param {ObjectId} customerId
 * @param {Object} context
 * @returns {Promise<Customer>}
 */
const deleteCustomerById = async (customerId, context = {}) => {
  const customer = await getCustomerById(customerId, context);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.customer.notFound);
  }

  const { Sale } = require('../models');
  const salesCount = await Sale.countDocuments({ customer: customerId });
  if (salesCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.customer.cannotDeleteWithSales);
  }

  await customer.remove();
  return customer;
};

/**
 * Generate an Excel import template file for customers.
 * Includes styled headers and 2 sample rows so users know what to fill in.
 *
 * @returns {Promise<Buffer>}
 */
const getCustomerImportTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WareHouseManagement';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Khách hàng');

  worksheet.columns = [
    { header: 'Tên', key: 'name', width: 30 },
    { header: 'SĐT', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Địa chỉ', key: 'address', width: 35 },
    { header: 'Ghi chú', key: 'note', width: 35 },
  ];

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

  const sampleRows = [
    { name: 'Nguyễn Văn A', phone: '0909123456', email: 'a@example.com', address: 'TP. Hồ Chí Minh', note: '' },
    { name: 'Trần Thị B', phone: '0987654321', email: 'b@example.com', address: 'Hà Nội', note: 'Khách thân thiết' },
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

  const noteRow = worksheet.addRow([
    '* Xóa các dòng mẫu trên trước khi nhập',
    '',
    '* Email (nếu có) phải đúng định dạng',
    '',
    '* Khách hàng được nhập theo chi nhánh đang đăng nhập',
  ]);
  noteRow.font = { color: { argb: 'FFCC0000' }, italic: true, size: 9 };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Import customers from an Excel file buffer.
 * Upsert rule (in scoped branch): phone -> email -> name+branch.
 *
 * @param {Buffer} buffer
 * @param {Object} context
 * @returns {Promise<{ imported: number, updated: number, errors: Array }>} 
 */
const importCustomersFromExcel = async (buffer, context = {}, branchId = null) => {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.customer.excel.invalidFile);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.customer.excel.invalidFile);
  }

  const headerRow = worksheet.getRow(1);
  const actualHeaders = [];
  headerRow.eachCell((cell) => {
    actualHeaders.push(String(cell.value || '').trim());
  });

  const missingHeaders = CUSTOMER_EXCEL_HEADERS.filter((h) => !actualHeaders.includes(h));
  if (missingHeaders.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `File Excel thiếu cột: ${missingHeaders.join(', ')}. Cần có: ${CUSTOMER_EXCEL_HEADERS.join(', ')}`
    );
  }

  const headerIndex = {};
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || '').trim();
    headerIndex[val] = colNumber;
  });

  const totalRows = worksheet.rowCount;
  if (totalRows < 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.customer.excel.noData);
  }

  const isValidEmailBasic = (email) => /.+@.+\..+/.test(String(email));

  const getCellValue = (row, header) => {
    const colIdx = headerIndex[header];
    if (!colIdx) return null;
    const cell = row.getCell(colIdx);
    const val = cell.value;
    if (val === null || val === undefined || val === '') return null;
    return String(val).trim();
  };

  // Customers require branch. Import template doesn't include branch column,
  // so we bind imported customers to the current request scope.
  const scopedBranch = context && context.isGlobalRole ? extractId(branchId) : extractId(context.branch);
  if (!scopedBranch) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.branch.required);
  }

  let imported = 0;
  let updated = 0;
  const errors = [];

  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);

    const name = getCellValue(row, 'Tên');
    const phone = getCellValue(row, 'SĐT');
    const email = getCellValue(row, 'Email');
    const address = getCellValue(row, 'Địa chỉ');
    const note = getCellValue(row, 'Ghi chú');

    if (!name && !phone && !email && !address && !note) continue;

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
      if (phone) query = { branch: scopedBranch, phone };
      else if (email) query = { branch: scopedBranch, email };
      else query = { branch: scopedBranch, name };

      const existingCustomer = await Customer.findOne(query);
      if (existingCustomer) {
        existingCustomer.name = name;
        if (phone !== null) existingCustomer.phone = phone;
        if (email !== null) existingCustomer.email = email;
        if (address !== null) existingCustomer.address = address;
        if (note !== null) existingCustomer.note = note;
        await existingCustomer.save();
        updated += 1;
      } else {
        const customerData = { name, branch: scopedBranch };
        if (phone !== null) customerData.phone = phone;
        if (email !== null) customerData.email = email;
        if (address !== null) customerData.address = address;
        if (note !== null) customerData.note = note;
        await Customer.create(customerData);
        imported += 1;
      }
    } catch (err) {
      errors.push({ row: rowNumber, key, errors: [err.message] });
    }
  }

  return { imported, updated, errors };
};

/**
 * Export customers to an Excel workbook buffer.
 *
 * @param {Object} filter
 * @param {Object} context
 * @returns {Promise<Buffer>}
 */
const exportCustomersToExcel = async (filter = {}, context = {}) => {
  const scopedFilter = applyBranchScope(filter, context);

  const customers = await Customer.find(scopedFilter).lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WareHouseManagement';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Khách hàng');

  worksheet.columns = [
    { header: 'Tên', key: 'name', width: 30 },
    { header: 'SĐT', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Địa chỉ', key: 'address', width: 35 },
    { header: 'Ghi chú', key: 'note', width: 35 },
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

  customers.forEach((customer) => {
    worksheet.addRow({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      note: customer.note || '',
    });
  });

  // Zebra striping
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

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  createCustomer,
  queryCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
  getCustomerImportTemplate,
  importCustomersFromExcel,
  exportCustomersToExcel,
};
