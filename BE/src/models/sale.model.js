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

    totalAmount: {
      type: Number,
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
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
