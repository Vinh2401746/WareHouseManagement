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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    received_date: {
      type: Date,
      required: true,
      default: Date.now,
      comment: 'Ngày nhập hàng',
    },
    production_date: {
      type: Date,
      required: true,
      comment: 'Ngày sản xuất',
    },
    expiration_date: {
      type: Date,
      required: true,
      comment: 'Ngày hết hạn',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Giá bán',
    },
    unit: {
      type: String,
      required: true,
    },
    minStock: {
      type: Number,
      default: 0,
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
