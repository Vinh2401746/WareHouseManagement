const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Product, ProductBatch, InventoryTransaction, Sale } = require('../models');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const { INVENTORY_TRANSACTION_TYPES, INVENTORY_TRANSACTION_REASONS } = require('../constants/inventoryTransaction.constant');
const { resolveScopedWarehouseIds, applyBranchScope } = require('../utils/branchScope');

const DEFAULT_DATE_RANGE_DAYS = 30;
const MAX_PAGE_LIMIT = 100;
const DETAIL_HISTORY_LIMIT = 10;

const roundCurrency = (value) => Math.round(Number(value) || 0);

const normalizeObjectId = (value) => {
  if (!value) {
    return null;
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }
  if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
    return mongoose.Types.ObjectId(value);
  }
  if (value._id && mongoose.Types.ObjectId.isValid(value._id)) {
    return mongoose.Types.ObjectId(value._id);
  }
  return null;
};

const normalizeObjectIdArray = (input) => {
  if (!input) {
    return [];
  }
  const items = Array.isArray(input) ? input : [input];
  const uniqueIds = new Set();
  items.forEach((item) => {
    const normalized = normalizeObjectId(item);
    if (normalized) {
      uniqueIds.add(normalized.toString());
    }
  });
  return Array.from(uniqueIds).map((id) => mongoose.Types.ObjectId(id));
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.toLowerCase());
  }
  return false;
};

const escapeRegex = (keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildProductFilter = (filters = {}) => {
  const filter = {};
  const productIds = normalizeObjectIdArray(filters.productIds || filters.productId);
  if (productIds.length > 0) {
    filter._id = { $in: productIds };
  }

  const keyword = typeof filters.keyword === 'string' ? filters.keyword.trim() : '';
  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), 'i');
    filter.$or = [{ code: regex }, { name: regex }];
  }
  return filter;
};

const buildPaginationOptions = (options = {}) => {
  const limitRaw = Number(options.limit) || 10;
  const pageRaw = Number(options.page) || 1;

  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, limitRaw));
  const page = Math.max(1, pageRaw);

  const paginationOptions = {
    limit,
    page,
    populate: 'unit',
  };

  if (options.sortBy) {
    paginationOptions.sortBy = options.sortBy;
  } else {
    paginationOptions.sortBy = 'name:asc';
  }

  return paginationOptions;
};

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveDateRange = (filters = {}) => {
  const rawStart = parseDateInput(filters.startDate || filters.dateFrom || filters.fromDate);
  const rawEnd = parseDateInput(filters.endDate || filters.dateTo || filters.toDate);

  const endDate = rawEnd || new Date();
  const startDate = rawStart || new Date(endDate.getTime() - DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000);

  if (startDate > endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Khoảng thời gian không hợp lệ');
  }

  return { startDate, endDate };
};

const mapProductBasics = (productDoc) => {
  if (!productDoc) {
    return null;
  }
  const data = productDoc.toJSON ? productDoc.toJSON() : productDoc;
  return {
    id: data._id ? data._id.toString() : data.id,
    code: data.code,
    name: data.name,
    imageUrl: data.imageUrl || null,
    sellingPrice: data.sellingPrice || 0,
    minStock: data.minStock || 0,
    unit: data.unit
      ? {
          id: data.unit._id ? data.unit._id.toString() : data.unit,
          name: data.unit.name || undefined,
          code: data.unit.code || undefined,
        }
      : null,
  };
};

const aggregateStockMeta = async ({ productIds, warehouseIds }) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return new Map();
  }

  const matchStage = { product: { $in: productIds } };
  if (warehouseIds.length > 0) {
    matchStage.warehouse = { $in: warehouseIds };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { product: '$product', warehouse: '$warehouse' },
        quantity: { $sum: '$quantity' },
        validQuantity: {
          $sum: {
            $cond: [{ $gte: ['$expiryDate', new Date()] }, '$quantity', 0]
          }
        },
        value: { $sum: { $multiply: ['$quantity', '$importPrice'] } },
        lastImportAt: { $max: '$updatedAt' },
      },
    },
    {
      $group: {
        _id: '$_id.product',
        totalQuantity: { $sum: '$quantity' },
        totalValidQuantity: { $sum: '$validQuantity' },
        totalValue: { $sum: '$value' },
        lastImportAt: { $max: '$lastImportAt' },
        byWarehouse: {
          $push: {
            warehouse: '$_id.warehouse',
            quantity: '$quantity',
            validQuantity: '$validQuantity',
            value: '$value',
          },
        },
      },
    },
  ];

  const docs = await ProductBatch.aggregate(pipeline);
  const map = new Map();

  docs.forEach((doc) => {
    map.set(doc._id.toString(), {
      totalQuantity: doc.totalQuantity || 0,
      totalValidQuantity: doc.totalValidQuantity || 0,
      totalValue: doc.totalValue || 0,
      lastImportAt: doc.lastImportAt || null,
      byWarehouse: Array.isArray(doc.byWarehouse)
        ? doc.byWarehouse.map((entry) => ({
            warehouse: entry.warehouse ? entry.warehouse.toString() : null,
            quantity: entry.quantity || 0,
            validQuantity: entry.validQuantity || 0,
            value: entry.value || 0,
          }))
        : [],
    });
  });

  return map;
};

const aggregateSalesMeta = async ({ productIds, warehouseIds, dateRange }) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return new Map();
  }

  const matchStage = {
    'items.product': { $in: productIds },
  };

  if (warehouseIds.length > 0) {
    matchStage.warehouse = { $in: warehouseIds };
  }

  if (dateRange.startDate || dateRange.endDate) {
    matchStage.saleDate = {};
    if (dateRange.startDate) {
      matchStage.saleDate.$gte = dateRange.startDate;
    }
    if (dateRange.endDate) {
      matchStage.saleDate.$lte = dateRange.endDate;
    }
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.product': { $in: productIds } } },
    {
      $group: {
        _id: '$items.product',
        revenue: { $sum: '$items.lineTotal' },
        cost: { $sum: '$items.costTotal' },
        quantity: { $sum: '$items.quantity' },
        lastExportAt: { $max: '$saleDate' },
        missingCostLines: {
          $sum: {
            $cond: [{ $lte: ['$items.costTotal', 0] }, 1, 0],
          },
        },
      },
    },
  ];

  const docs = await Sale.aggregate(pipeline);
  const map = new Map();
  docs.forEach((doc) => {
    map.set(doc._id.toString(), {
      revenue: doc.revenue || 0,
      cost: doc.cost || 0,
      quantity: doc.quantity || 0,
      lastExportAt: doc.lastExportAt || null,
      missingCostLines: doc.missingCostLines || 0,
    });
  });
  return map;
};

const aggregateManualExportsMeta = async ({ productIds, warehouseIds, dateRange }) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return new Map();
  }

  const matchStage = {
    type: INVENTORY_TRANSACTION_TYPES.EXPORT,
    'items.product': { $in: productIds },
    $or: [{ sale: { $exists: false } }, { sale: null }],
  };

  if (warehouseIds.length > 0) {
    matchStage.warehouse = { $in: warehouseIds };
  }

  if (dateRange.startDate || dateRange.endDate) {
    matchStage.transactionDate = {};
    if (dateRange.startDate) {
      matchStage.transactionDate.$gte = dateRange.startDate;
    }
    if (dateRange.endDate) {
      matchStage.transactionDate.$lte = dateRange.endDate;
    }
  }

  if (!matchStage.reason) {
    matchStage.reason = { $ne: INVENTORY_TRANSACTION_REASONS.SALE };
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.product': { $in: productIds } } },
    {
      $group: {
        _id: '$items.product',
        quantity: { $sum: '$items.quantity' },
        cost: { $sum: '$items.costTotal' },
        lastExportAt: { $max: '$transactionDate' },
        missingCostLines: {
          $sum: {
            $cond: [{ $lte: ['$items.costTotal', 0] }, 1, 0],
          },
        },
      },
    },
  ];

  const docs = await InventoryTransaction.aggregate(pipeline);
  const map = new Map();
  docs.forEach((doc) => {
    map.set(doc._id.toString(), {
      quantity: doc.quantity || 0,
      cost: doc.cost || 0,
      lastExportAt: doc.lastExportAt || null,
      missingCostLines: doc.missingCostLines || 0,
    });
  });
  return map;
};

const mergeOverviewRow = (productDoc, stockMeta = {}, saleMeta = {}, manualMeta = {}) => {
  const product = mapProductBasics(productDoc);
  const minStock = product.minStock || 0;
  const totalStock = stockMeta.totalQuantity || 0;
  const validStock = stockMeta.totalValidQuantity || 0;
  const totalStockValue = roundCurrency(stockMeta.totalValue || 0);
  const revenue = saleMeta.revenue || 0;
  const costOfGoods = saleMeta.cost || 0;
  const manualAdjustmentsCost = manualMeta.cost || 0;
  const profit = roundCurrency(revenue - costOfGoods - manualAdjustmentsCost);
  const soldQuantity = saleMeta.quantity || 0;
  const manualExportQuantity = manualMeta.quantity || 0;
  const lastImportAt = stockMeta.lastImportAt || null;
  const lastExportSource = [saleMeta.lastExportAt, manualMeta.lastExportAt].filter(Boolean);
  const lastExportAt =
    lastExportSource.length > 0 ? new Date(Math.max(...lastExportSource.map((date) => date.getTime()))) : null;
  const isBelowMin = minStock > 0 && validStock < minStock;
  const missingCostLines = (saleMeta.missingCostLines || 0) + (manualMeta.missingCostLines || 0);

  const alerts = [];
  if (isBelowMin) {
    alerts.push('Tồn kho thấp hơn ngưỡng tối thiểu');
  }
  if (missingCostLines > 0) {
    alerts.push(`Thiếu snapshot giá vốn cho ${missingCostLines} dòng giao dịch`);
  }

  return {
    product,
    stockByWarehouse: stockMeta.byWarehouse || [],
    totalStock,
    validStock,
    totalStockValue,
    revenue,
    costOfGoods,
    manualAdjustmentsCost,
    profit,
    soldQuantity,
    manualExportQuantity,
    lastImportAt,
    lastExportAt,
    isBelowMin,
    alerts,
    missingCostLines,
  };
};

const buildOverviewWarnings = (rows) => {
  const warnings = [];
  rows.forEach((row) => {
    if (row.missingCostLines > 0) {
      warnings.push(
        `Sản phẩm ${row.product.code} thiếu giá vốn cho ${row.missingCostLines} dòng giao dịch, vui lòng kiểm tra batch hoặc phiếu xuất thủ công`
      );
    }
  });
  return warnings;
};

const getInventoryOverview = async (filters = {}, options = {}, context = {}) => {
  let productFilter = buildProductFilter(filters);
  productFilter = applyBranchScope(productFilter, context);
  const paginationOptions = buildPaginationOptions(options);
  const [productsPage, dateRange] = await Promise.all([
    Product.paginate(productFilter, paginationOptions),
    Promise.resolve(resolveDateRange(filters)),
  ]);

  const requestedWarehouseFilter = filters.warehouseIds || filters.warehouseId || filters.warehouse;
  const scopedWarehouseInput = await resolveScopedWarehouseIds(requestedWarehouseFilter, context);
  const warehouseFilterInput = scopedWarehouseInput === null ? requestedWarehouseFilter : scopedWarehouseInput;
  const warehouseIds = normalizeObjectIdArray(warehouseFilterInput);
  const productIds = productsPage.results.map((doc) => normalizeObjectId(doc._id || doc.id)).filter(Boolean);

  const [stockMeta, saleMeta, manualMeta] = await Promise.all([
    aggregateStockMeta({ productIds, warehouseIds }),
    aggregateSalesMeta({ productIds, warehouseIds, dateRange }),
    aggregateManualExportsMeta({ productIds, warehouseIds, dateRange }),
  ]);

  const rows = productsPage.results.map((productDoc) => {
    const key = (productDoc._id || productDoc.id).toString();
    return mergeOverviewRow(productDoc, stockMeta.get(key) || {}, saleMeta.get(key) || {}, manualMeta.get(key) || {});
  });

  const alertOnly = parseBoolean(filters.alertOnly);
  const filteredRows = alertOnly ? rows.filter((row) => row.isBelowMin) : rows;

  const summary = filteredRows.reduce(
    (acc, row) => {
      acc.totalStock += row.totalStock;
      acc.totalStockValue += row.totalStockValue;
      acc.totalRevenue += row.revenue;
      acc.totalCost += row.costOfGoods + row.manualAdjustmentsCost;
      acc.totalProfit += row.profit;
      if (row.isBelowMin) {
        acc.lowStockCount += 1;
      }
      return acc;
    },
    {
      totalStock: 0,
      totalStockValue: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      lowStockCount: 0,
    }
  );

  summary.totalStockValue = roundCurrency(summary.totalStockValue);
  summary.totalProfit = roundCurrency(summary.totalProfit);

  const warnings = buildOverviewWarnings(filteredRows);

  return {
    results: filteredRows,
    page: productsPage.page,
    limit: productsPage.limit,
    totalResults: productsPage.totalResults,
    totalPages: productsPage.totalPages,
    summary,
    warnings,
    dateRange,
  };
};

const fetchImportHistory = async ({ productId, warehouseIds, dateRange }) => {
  const matchStage = {
    type: INVENTORY_TRANSACTION_TYPES.IMPORT,
    'items.product': productId,
  };

  if (warehouseIds.length > 0) {
    matchStage.warehouse = { $in: warehouseIds };
  }

  if (dateRange.startDate || dateRange.endDate) {
    matchStage.transactionDate = {};
    if (dateRange.startDate) {
      matchStage.transactionDate.$gte = dateRange.startDate;
    }
    if (dateRange.endDate) {
      matchStage.transactionDate.$lte = dateRange.endDate;
    }
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.product': productId } },
    { $sort: { transactionDate: -1, createdAt: -1 } },
    { $limit: DETAIL_HISTORY_LIMIT },
    {
      $project: {
        _id: 0,
        transactionId: '$_id',
        transactionDate: '$transactionDate',
        quantity: '$items.quantity',
        price: '$items.price',
        totalAmount: '$items.totalAmount',
        supplier: '$supplier',
        warehouse: '$warehouse',
        batch: '$items.batch',
      },
    },
  ];

  return InventoryTransaction.aggregate(pipeline);
};

const fetchManualExportHistory = async ({ productId, warehouseIds, dateRange }) => {
  const matchStage = {
    type: INVENTORY_TRANSACTION_TYPES.EXPORT,
    'items.product': productId,
    reason: { $ne: INVENTORY_TRANSACTION_REASONS.SALE },
    $or: [{ sale: { $exists: false } }, { sale: null }],
  };

  if (warehouseIds.length > 0) {
    matchStage.warehouse = { $in: warehouseIds };
  }

  if (dateRange.startDate || dateRange.endDate) {
    matchStage.transactionDate = {};
    if (dateRange.startDate) {
      matchStage.transactionDate.$gte = dateRange.startDate;
    }
    if (dateRange.endDate) {
      matchStage.transactionDate.$lte = dateRange.endDate;
    }
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.product': productId } },
    { $sort: { transactionDate: -1, createdAt: -1 } },
    { $limit: DETAIL_HISTORY_LIMIT },
    {
      $project: {
        _id: 0,
        transactionId: '$_id',
        transactionDate: '$transactionDate',
        quantity: '$items.quantity',
        costPrice: '$items.costPrice',
        costTotal: '$items.costTotal',
        warehouse: '$warehouse',
        reason: '$reason',
      },
    },
  ];

  return InventoryTransaction.aggregate(pipeline);
};

const fetchSaleHistory = async ({ productId, warehouseIds, dateRange }) => {
  const matchStage = {
    'items.product': productId,
  };

  if (warehouseIds.length > 0) {
    matchStage.warehouse = { $in: warehouseIds };
  }

  if (dateRange.startDate || dateRange.endDate) {
    matchStage.saleDate = {};
    if (dateRange.startDate) {
      matchStage.saleDate.$gte = dateRange.startDate;
    }
    if (dateRange.endDate) {
      matchStage.saleDate.$lte = dateRange.endDate;
    }
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.product': productId } },
    { $sort: { saleDate: -1, createdAt: -1 } },
    { $limit: DETAIL_HISTORY_LIMIT },
    {
      $project: {
        _id: 0,
        saleId: '$_id',
        code: '$code',
        saleDate: '$saleDate',
        customerName: '$customerName',
        warehouse: '$warehouse',
        quantity: '$items.quantity',
        price: '$items.price',
        lineTotal: '$items.lineTotal',
        costPrice: '$items.costPrice',
        costTotal: '$items.costTotal',
      },
    },
  ];

  return Sale.aggregate(pipeline);
};

const buildDetailHistories = ({ imports, manualExports, sales }) => ({
  imports,
  manualExports,
  sales,
});

const getInventoryDetail = async (productId, filters = {}, context = {}) => {
  const product = await Product.findById(productId).populate('unit');
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessages.product.notFound);
  }

  const requestedWarehouseFilter = filters.warehouseIds || filters.warehouseId || filters.warehouse;
  const scopedWarehouseInput = await resolveScopedWarehouseIds(requestedWarehouseFilter, context);
  const warehouseFilterInput = scopedWarehouseInput === null ? requestedWarehouseFilter : scopedWarehouseInput;
  const warehouseIds = normalizeObjectIdArray(warehouseFilterInput);
  const dateRange = resolveDateRange(filters);
  const productObjectId = normalizeObjectId(product._id);

  const [stockMeta, saleMetaMap, manualMetaMap, importHistory, manualExportHistory, saleHistory] = await Promise.all([
    aggregateStockMeta({ productIds: [productObjectId], warehouseIds }),
    aggregateSalesMeta({ productIds: [productObjectId], warehouseIds, dateRange }),
    aggregateManualExportsMeta({ productIds: [productObjectId], warehouseIds, dateRange }),
    fetchImportHistory({ productId: productObjectId, warehouseIds, dateRange }),
    fetchManualExportHistory({ productId: productObjectId, warehouseIds, dateRange }),
    fetchSaleHistory({ productId: productObjectId, warehouseIds, dateRange }),
  ]);

  const key = productObjectId.toString();
  const mergedRow = mergeOverviewRow(
    product,
    stockMeta.get(key) || {},
    saleMetaMap.get(key) || {},
    manualMetaMap.get(key) || {}
  );

  return {
    product: mergedRow.product,
    stockSnapshot: {
      totalStock: mergedRow.totalStock,
      validStock: mergedRow.validStock,
      totalStockValue: mergedRow.totalStockValue,
      lastImportAt: mergedRow.lastImportAt,
      stockByWarehouse: mergedRow.stockByWarehouse,
    },
    profitSummary: {
      revenue: mergedRow.revenue,
      costOfGoods: mergedRow.costOfGoods,
      manualAdjustmentsCost: mergedRow.manualAdjustmentsCost,
      profit: mergedRow.profit,
    },
    sales: {
      soldQuantity: mergedRow.soldQuantity,
      manualExportQuantity: mergedRow.manualExportQuantity,
      lastExportAt: mergedRow.lastExportAt,
    },
    alerts: mergedRow.alerts,
    histories: buildDetailHistories({
      imports: importHistory,
      manualExports: manualExportHistory,
      sales: saleHistory,
    }),
    dateRange,
  };
};

const getProductsForPOS = async (filters = {}, options = {}, context = {}) => {
  let productFilter = buildProductFilter({ keyword: filters.keyword });
  productFilter = applyBranchScope(productFilter, context);
  const paginationOptions = buildPaginationOptions(options);

  const productsPage = await Product.paginate(productFilter, paginationOptions);
  
  if (!filters.warehouseId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Khuyến nghị: Phải có warehouseId để xem tồn kho ở POS');
  }

  const scopedWarehouseInput = await resolveScopedWarehouseIds(filters.warehouseId, context);
  if (!scopedWarehouseInput) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Không có quyền truy cập kho này hoặc kho không tồn tại');
  }
  const warehouseIds = normalizeObjectIdArray(scopedWarehouseInput);
  const productIds = productsPage.results.map((doc) => normalizeObjectId(doc._id || doc.id)).filter(Boolean);

  const stockMeta = await aggregateStockMeta({ productIds, warehouseIds });

  const rows = productsPage.results.map((productDoc) => {
    const key = (productDoc._id || productDoc.id).toString();
    const meta = stockMeta.get(key) || {};
    const product = mapProductBasics(productDoc);
    
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      imageUrl: product.imageUrl,
      unit: product.unit,
      sellingPrice: product.sellingPrice,
      totalStock: meta.totalValidQuantity || 0,
      physicalStock: meta.totalQuantity || 0,
    };
  });

  return {
    results: rows,
    page: productsPage.page,
    limit: productsPage.limit,
    totalResults: productsPage.totalResults,
    totalPages: productsPage.totalPages,
  };
};

module.exports = {
  getInventoryOverview,
  getInventoryDetail,
  getProductsForPOS,
};
