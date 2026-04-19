const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { supplierService } = require('../services');
const responseMessages = require('../constants/responseMessages');

const createSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(httpStatus.CREATED).send(supplier);
});

const getSuppliers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'phone', 'email', 'address']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await supplierService.querySuppliers(filter, options);
  res.send(result);
});

const getSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.supplier.notFound);
  }
  res.send(supplier);
});

const updateSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.updateSupplierById(req.params.supplierId, req.body);
  res.send(supplier);
});

const deleteSupplier = catchAsync(async (req, res) => {
  await supplierService.deleteSupplierById(req.params.supplierId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getImportTemplate = catchAsync(async (req, res) => {
  const buffer = await supplierService.getSupplierImportTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="supplier_import_template.xlsx"');
  res.send(Buffer.from(buffer));
});

const importSuppliers = catchAsync(async (req, res) => {
  const { file } = req;
  if (!file || !file.buffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.supplier.excel.invalidFile);
  }

  // Chỉ chấp nhận .xlsx theo quyết định MVP
  if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.supplier.excel.invalidFile);
  }

  const result = await supplierService.importSuppliersFromExcel(file.buffer);
  res.send(result);
});

const exportSuppliers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'phone', 'email', 'address']);
  const buffer = await supplierService.exportSuppliersToExcel(filter);

  const filename = `suppliers_${Date.now()}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(buffer));
});

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  getImportTemplate,
  importSuppliers,
  exportSuppliers,
};
