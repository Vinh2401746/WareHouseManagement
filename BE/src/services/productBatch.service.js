const httpStatus = require('http-status');
const { ProductBatch, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');

/**
 * Create a productBatch
 * @param {Object} productBatchBody
 * @returns {Promise<ProductBatch>}
 */
const createProductBatch = async (productBatchBody) => {
  const { product, warehouse, batchCode, manufactureDate, expiryDate, quantity, importPrice } = productBatchBody;

  // basic date validation
  if (manufactureDate && expiryDate) {
    const mfg = new Date(manufactureDate);
    const exp = new Date(expiryDate);
    if (!Number.isFinite(mfg.getTime()) || !Number.isFinite(exp.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.productBatch.invalidManufactureExpiryDate);
    }
    if (exp <= mfg) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.productBatch.expiryDateAfterManufactureDate);
    }
  }

  // normalize/generate batch code if missing
  const normalizedCode =
    batchCode && String(batchCode).trim()
      ? String(batchCode).trim()
      : `B${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase()}`;

  // prevent duplicate batch per product & warehouse
  const existing = await ProductBatch.findOne({ product, warehouse, batchCode: normalizedCode });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.productBatch.batchCodeExists);
  }

  // cộng số lượng sản phẩm trong kho
  const thisProduct = await Product.findById(product);
  if (!thisProduct) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessages.product.notFound);
  }
  thisProduct.quantityInStock += quantity || 0;
  await thisProduct.save();

  const payload = {
    product,
    warehouse,
    batchCode: normalizedCode,
    manufactureDate,
    expiryDate,
    quantity: quantity || 0,
    importPrice,
  };

  const productBatch = await ProductBatch.create(payload);
  return productBatch;
};

/**
 * Query for productBatches
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProductBatches = async (filter, options) => {
  options.populate = 'product warehouse';
  const productBatches = await ProductBatch.paginate(filter, options);
  return productBatches;
};

/**
 * Get productBatch by id
 * @param {ObjectId} id
 * @returns {Promise<ProductBatch>}
 */
const getProductBatchById = async (id) => {
  return ProductBatch.findById(id).populate('product warehouse');
};

/**
 * Update productBatch by id
 * @param {ObjectId} productBatchId
 * @param {Object} updateBody
 * @returns {Promise<ProductBatch>}
 */
const updateProductBatchById = async (productBatchId, updateBody) => {
  const productBatch = await getProductBatchById(productBatchId);
  if (!productBatch) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.productBatch.notFound);
  }
  Object.assign(productBatch, updateBody);
  await productBatch.save();
  return productBatch;
};

/**
 * Delete productBatch by id
 * @param {ObjectId} productBatchId
 * @returns {Promise<ProductBatch>}
 */
const deleteProductBatchById = async (productBatchId) => {
  const productBatch = await getProductBatchById(productBatchId);
  if (!productBatch) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.productBatch.notFound);
  }
  await productBatch.remove();
  return productBatch;
};

module.exports = {
  createProductBatch,
  queryProductBatches,
  getProductBatchById,
  updateProductBatchById,
  deleteProductBatchById,
};
