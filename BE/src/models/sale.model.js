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

    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED', 'CANCELLED'],
      default: 'COMPLETED',
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

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },

    customerName: {
      type: String,
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

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    debtAmount: {
      type: Number,
      default: 0,
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
        costPrice: {
          type: Number,
          min: 0,
          default: 0,
          comment: 'Giá vốn snapshot tại thời điểm bán',
        },
        costTotal: {
          type: Number,
          min: 0,
          default: 0,
          comment: 'Tổng giá vốn cho dòng hàng',
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
