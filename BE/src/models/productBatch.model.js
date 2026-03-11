const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productBatchSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productCode: {
      type: String,
      trim: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    batchCode: {
      type: String,
      required: true,
    },
    manufactureDate: Date,
    expiryDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    importPrice: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productBatchSchema.plugin(toJSON);
productBatchSchema.plugin(paginate);

/**
 * @typedef ProductBatch
 */
const ProductBatch = mongoose.model('ProductBatch', productBatchSchema);

module.exports = ProductBatch;
