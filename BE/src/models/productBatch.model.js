const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productBatchSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
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
  },
  {
    timestamps: true,
  }
);

productBatchSchema.plugin(toJSON);
productBatchSchema.plugin(paginate);

const ProductBatch = mongoose.model('ProductBatch', productBatchSchema);
module.exports = ProductBatch;
