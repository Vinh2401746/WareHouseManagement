const mongoose = require('mongoose');
const { InventoryTransaction, ProductBatch } = require('../models');
const { resolveScopedWarehouseIds } = require('../utils/branchScope');
const { INVENTORY_TRANSACTION_TYPES } = require('../constants/inventoryTransaction.constant');
const productInventoryService = require('./productInventory.service');

const parseDateInput = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveDateRange = (filters = {}) => {
  const endDate = parseDateInput(filters.endDate) || new Date();
  const startDate = parseDateInput(filters.startDate) || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { startDate, endDate };
};

const getOverview = async (filters = {}, context = {}) => {
  // 1. Resolve Warehouse Scope
  const requestedWarehouseFilter = filters.warehouseId || filters.branchId;
  const scopedWarehouseInput = await resolveScopedWarehouseIds(requestedWarehouseFilter, context);
  const warehouseFilterInput = scopedWarehouseInput === null ? requestedWarehouseFilter : scopedWarehouseInput;
  
  let warehouseIds = [];
  if (warehouseFilterInput) {
    const inputArr = Array.isArray(warehouseFilterInput) ? warehouseFilterInput : [warehouseFilterInput];
    // Filter out invalid ObjectIds to prevent cast errors
    warehouseIds = inputArr.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => mongoose.Types.ObjectId(id));
  }

  const baseMatch = {};
  if (warehouseIds.length > 0) {
    baseMatch.warehouse = { $in: warehouseIds };
  }

  // 2. Resolve Date Range
  const { startDate, endDate } = resolveDateRange(filters);

  // 3. Promises
  const pendingImportsPromise = InventoryTransaction.countDocuments({
    ...baseMatch,
    type: INVENTORY_TRANSACTION_TYPES.IMPORT,
    status: 'PENDING',
  });
  
  const pendingExportsPromise = InventoryTransaction.countDocuments({
    ...baseMatch,
    type: INVENTORY_TRANSACTION_TYPES.EXPORT,
    status: 'PENDING',
  });

  const totalStockPromise = ProductBatch.aggregate([
    ...(warehouseIds.length > 0 ? [{ $match: { warehouse: { $in: warehouseIds } } }] : []),
    {
      $group: {
        _id: null,
        totalStock: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$importPrice'] } },
      }
    }
  ]);

  const lowStockFilters = { alertOnly: true };
  if (filters.warehouseId) lowStockFilters.warehouseId = filters.warehouseId;
  if (filters.branchId) lowStockFilters.branchId = filters.branchId;
  const lowStockPromise = productInventoryService.getInventoryOverview(lowStockFilters, { limit: 5 }, context);

  const chartMatch = {
    ...baseMatch,
    status: 'COMPLETED',
    transactionDate: { $gte: startDate, $lte: endDate },
  };

  const chartAggregationPromise = InventoryTransaction.aggregate([
    { $match: chartMatch },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate', timezone: 'Asia/Ho_Chi_Minh' } },
          type: '$type',
        },
        totalQuantity: { $sum: '$items.quantity' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  const recentTransactionsPromise = InventoryTransaction.find(baseMatch)
    .sort({ transactionDate: -1, createdAt: -1 })
    .limit(5)
    .populate('createdBy', 'name')
    .select('type status transactionDate totalAmount createdBy reason');

  const [
    pendingImports,
    pendingExports,
    totalStockData,
    lowStockData,
    chartDataRaw,
    recentDbRows
  ] = await Promise.all([
    pendingImportsPromise,
    pendingExportsPromise,
    totalStockPromise,
    lowStockPromise,
    chartAggregationPromise,
    recentTransactionsPromise,
  ]);

  const totalStock = totalStockData.length > 0 ? totalStockData[0].totalStock : 0;
  const totalStockValue = totalStockData.length > 0 ? totalStockData[0].totalValue : 0;

  const datesSet = new Set();
  const importMap = new Map();
  const exportMap = new Map();

  chartDataRaw.forEach(item => {
    const dateStr = item._id.date;
    datesSet.add(dateStr);
    if (item._id.type === INVENTORY_TRANSACTION_TYPES.IMPORT) {
      importMap.set(dateStr, item.totalQuantity);
    } else {
      exportMap.set(dateStr, item.totalQuantity);
    }
  });

  const datesArray = Array.from(datesSet).sort();
  const importData = datesArray.map(d => importMap.get(d) || 0);
  const exportData = datesArray.map(d => exportMap.get(d) || 0);

  const recentTransactions = recentDbRows.map(doc => ({
    id: doc._id,
    type: doc.type,
    status: doc.status,
    transactionDate: doc.transactionDate,
    totalAmount: doc.totalAmount,
    createdBy: doc.createdBy ? doc.createdBy.name : 'System',
    reason: doc.reason,
  }));

  const lowStockProductsCount = lowStockData.summary ? lowStockData.summary.lowStockCount : 0;
  const lowStockAlerts = (lowStockData.results || []).map(r => ({
    id: r.product.id,
    code: r.product.code,
    name: r.product.name,
    minStock: r.product.minStock,
    currentStock: r.totalStock,
  }));

  return {
    kpis: {
      totalStock,
      totalStockValue,
      pendingImports,
      pendingExports,
      lowStockProductsCount,
    },
    charts: {
      dates: datesArray,
      importData,
      exportData,
    },
    recentTransactions,
    lowStockAlerts,
  };
};

module.exports = {
  getOverview,
};
