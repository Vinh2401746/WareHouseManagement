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
    deliveryPerson: {
      type: String,
      required: false,
      comment: 'Người giao hàng (áp dụng cho nhập hàng)',
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Tổng tiền hàng trước thuế/CK',
    },
    discountMoney: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Tiền chiết khấu',
    },
    taxMoney: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Tiền thuế',
    },
    totalAmountAfterFax: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Tổng tiền sau thuế và chiết khấu',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELED'],
      default: 'PENDING',
      comment: 'Trạng thái của giao dịch',
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
          min: 0,
        },
        totalAmount: {
          type: Number,
          default: 0,
          min: 0,
        },
        costPrice: {
          type: Number,
          min: 0,
          default: 0,
          comment: 'Giá vốn snapshot cho dòng EXPORT',
        },
        costTotal: {
          type: Number,
          min: 0,
          default: 0,
          comment: 'Tổng giá vốn dòng EXPORT',
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
