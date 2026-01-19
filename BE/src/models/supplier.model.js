const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const supplierSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: String,
    email: String,
    address: String,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
supplierSchema.plugin(toJSON);
supplierSchema.plugin(paginate);

/**
 * @typedef Supplier
 */
const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
