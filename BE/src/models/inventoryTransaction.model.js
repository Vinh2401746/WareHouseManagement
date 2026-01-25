const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const inventoryTransactionSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['IMPORT', 'EXPORT'],
      required: true,
    },

    reason: {
      type: String,
      enum: ['PURCHASE', 'SALE', 'DESTROY'],
      required: true,
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
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    transactionDate: {
      type: Date,
      default: Date.now,
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
