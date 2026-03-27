const mongoose = require('mongoose');
const { Warehouse } = require('../models');

const EMPTY_OBJECT_ID = '000000000000000000000000';

const extractId = (value) => {
  if (!value) {
    return null;
  }
  if (mongoose.Types.ObjectId.isValid(value)) {
    return value.toString();
  }
  if (typeof value === 'object' && mongoose.Types.ObjectId.isValid(value._id)) {
    return value._id.toString();
  }
  return null;
};

const normalizeIdArray = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (Array.isArray(value)) {
    const normalized = value.map(extractId).filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.$in)) {
      const normalized = value.$in.map(extractId).filter(Boolean);
      return normalized.length > 0 ? normalized : null;
    }
    const nestedId = extractId(value);
    if (nestedId) {
      return [nestedId];
    }
  }
  const singleId = extractId(value);
  return singleId ? [singleId] : null;
};

const isGlobalScope = (context = {}) => Boolean(context.isGlobalRole) || (context.role && context.role.scope === 'global');

const loadAllowedWarehouseIds = async (context = {}) => {
  if (!context) {
    return [];
  }
  if (Array.isArray(context.allowedWarehouseIds)) {
    return context.allowedWarehouseIds;
  }

  const branchId = extractId(context.branch);
  if (!branchId) {
    context.allowedWarehouseIds = [];
    return [];
  }

  const warehouseDocs = await Warehouse.find({ branch: branchId }).select('_id').lean();
  const ids = warehouseDocs.map((warehouse) => warehouse._id.toString());
  context.allowedWarehouseIds = ids;
  return ids;
};

const applyBranchScope = (filter = {}, context = {}) => {
  if (isGlobalScope(context)) {
    return { ...filter };
  }

  const branchId = extractId(context.branch);
  if (!branchId) {
    return { ...filter };
  }

  const scopedFilter = { ...filter };
  const requestedBranch = extractId(scopedFilter.branch);
  if (requestedBranch && requestedBranch !== branchId) {
    scopedFilter.branch = branchId;
    return scopedFilter;
  }
  scopedFilter.branch = branchId;
  return scopedFilter;
};

const resolveScopedWarehouseIds = async (requestedWarehouseInput, context = {}) => {
  if (isGlobalScope(context)) {
    return normalizeIdArray(requestedWarehouseInput);
  }

  const allowedWarehouseIds = await loadAllowedWarehouseIds(context);
  const allowedSet = new Set(allowedWarehouseIds);
  const requestedIds = normalizeIdArray(requestedWarehouseInput);

  if (requestedIds && requestedIds.length > 0) {
    const filtered = requestedIds.filter((id) => allowedSet.has(id));
    if (filtered.length > 0) {
      return filtered;
    }
  }

  if (allowedWarehouseIds.length === 0) {
    return [EMPTY_OBJECT_ID];
  }

  return allowedWarehouseIds;
};

const applyWarehouseScope = async (filter = {}, context = {}) => {
  if (isGlobalScope(context)) {
    return { ...filter };
  }

  const scopedFilter = { ...filter };
  const scopedWarehouseIds = await resolveScopedWarehouseIds(scopedFilter.warehouse, context);

  if (!scopedWarehouseIds || scopedWarehouseIds.length === 0) {
    scopedFilter.warehouse = { $in: [EMPTY_OBJECT_ID] };
    return scopedFilter;
  }

  scopedFilter.warehouse = scopedWarehouseIds.length === 1 ? scopedWarehouseIds[0] : { $in: scopedWarehouseIds };
  return scopedFilter;
};

module.exports = {
  applyBranchScope,
  applyWarehouseScope,
  resolveScopedWarehouseIds,
  extractId,
};
