const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const saleSchema = mongoose.Schema(
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
      required: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },

    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      trim: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    discountMoney: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxMoney: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmountAfterFax: {
      type: Number,
      default: 0,
      min: 0,
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
          min: 0,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        lineTotal: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
saleSchema.plugin(toJSON);
saleSchema.plugin(paginate);

/**
 * @typedef Sale
 */
const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
