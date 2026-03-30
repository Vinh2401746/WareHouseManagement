const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    minStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    package: {
      type: String,
      trim: true,
      comment: 'Quy cách đóng gói',
    },
    imagePath: {
      type: String,
      trim: true,
      private: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
