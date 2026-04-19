const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const allocationSchema = mongoose.Schema(
  {
    sourceBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductBatch',
      required: true,
    },
    destinationBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductBatch',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    expiryDate: Date,
    importPrice: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const warehouseTransferSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
      comment: 'Mã phiếu luân chuyển kho',
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELED'],
      default: 'PENDING',
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        batch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProductBatch',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        allocations: [allocationSchema],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    canceledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    canceledAt: Date,
    cancelReason: {
      type: String,
      trim: true,
    },
    exportTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryTransaction',
    },
    importTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryTransaction',
    },
  },
  {
    timestamps: true,
  }
);

warehouseTransferSchema.plugin(toJSON);
warehouseTransferSchema.plugin(paginate);

/**
 * @typedef WarehouseTransfer
 */
const WarehouseTransfer = mongoose.model('WarehouseTransfer', warehouseTransferSchema);

module.exports = WarehouseTransfer;
