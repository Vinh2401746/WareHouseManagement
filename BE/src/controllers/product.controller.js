const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');
const responseMessages = require('../constants/responseMessages');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['code', 'name', 'unit', 'minStock']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.product.notFound);
  }
  res.send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProductById(req.params.productId, req.body);
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * GET /products/import-template
 * Download a pre-filled Excel template for product import.
 */
const getImportTemplate = catchAsync(async (req, res) => {
  const buffer = await productService.getProductImportTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="product_import_template.xlsx"');
  res.send(buffer);
});

/**
 * POST /products/import
 * Import products from an uploaded Excel file.
 */
const importProducts = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.product.excel.invalidFile);
  }
  const result = await productService.importProductsFromExcel(req.file.buffer);
  res.status(httpStatus.OK).send(result);
});

/**
 * GET /products/export
 * Export product list as an Excel file download.
 */
const exportProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['code', 'name']);
  const buffer = await productService.exportProductsToExcel(filter);

  const filename = `products_${Date.now()}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getImportTemplate,
  importProducts,
  exportProducts,
};
