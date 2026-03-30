const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    totalDebt: {
      type: Number,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
customerSchema.plugin(toJSON);
customerSchema.plugin(paginate);

/**
 * @typedef Customer
 */
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
