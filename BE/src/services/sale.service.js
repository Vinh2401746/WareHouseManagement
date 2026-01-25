const httpStatus = require('http-status');
const { Sale } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a sale
 * @param {Object} saleBody
 * @returns {Promise<Sale>}
 */
const createSale = async (req) => {
 const { branch, warehouse, items } = req.body;

  let totalAmount = 0;
  const exportItems = [];

  for (const item of items) {
    let remainingQty = item.quantity;

    const batches = await ProductBatch.find({
      product: item.product,
      warehouse,
      quantity: { $gt: 0 },
      expiryDate: { $gte: new Date() },
    }).sort({ expiryDate: 1 });

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const usedQty = Math.min(batch.quantity, remainingQty);
      batch.quantity -= usedQty;
      remainingQty -= usedQty;

      await batch.save();

      exportItems.push({
        product: item.product,
        batch: batch._id,
        quantity: usedQty,
        price: item.price,
      });
    }

    if (remainingQty > 0) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    totalAmount += item.quantity * item.price;
  }

  const sale = await Sale.create({
    code: `SALE-${Date.now()}`,
    branch,
    warehouse,
    soldBy: req.user.id,
    totalAmount,
    items,
  });

  await InventoryTransaction.create({
    type: 'EXPORT',
    reason: 'SALE',
    warehouse,
    sale: sale._id,
    createdBy: req.user.id,
    items: exportItems,
  });
  return sale;
};

/**
 * Query for sales
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySales = async (filter, options) => {
  const sales = await Sale.paginate(filter, options);
  return sales;
};

/**
 * Get sale by id
 * @param {ObjectId} id
 * @returns {Promise<Sale>}
 */
const getSaleById = async (id) => {
  return Sale.findById(id);
};

/**
 * Update sale by id
 * @param {ObjectId} saleId
 * @param {Object} updateBody
 * @returns {Promise<Sale>}
 */
const updateSaleById = async (saleId, updateBody) => {
  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sale not found');
  }
  Object.assign(sale, updateBody);
  await sale.save();
  return sale;
};

/**
 * Delete sale by id
 * @param {ObjectId} saleId
 * @returns {Promise<Sale>}
 */
const deleteSaleById = async (saleId) => {
  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sale not found');
  }
  await sale.remove();
  return sale;
};

module.exports = {
  createSale,
  querySales,
  getSaleById,
  updateSaleById,
  deleteSaleById,
};
