const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const inventoryTransactionSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['IMPORT', 'EXPORT'],
      required: true,
      comment: 'Loại giao dịch: nhập hoặc xuất',
    },
    reason: {
      type: String,
      required: false,
      comment: 'Lý do giao dịch',
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      comment: 'Liên kết đến đơn bán hàng nếu có',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      comment: 'Người tạo phiếu',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      comment: 'Ngày giao dịch',
    },
    // người giao hàng
    deliveryPerson: {
      type: String,
      required: false,
      comment: 'Người giao hàng (áp dụng cho nhập hàng)',
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
        },
        price: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
inventoryTransactionSchema.plugin(toJSON);
inventoryTransactionSchema.plugin(paginate);

/**
 * @typedef InventoryTransaction
 */
const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = InventoryTransaction;
