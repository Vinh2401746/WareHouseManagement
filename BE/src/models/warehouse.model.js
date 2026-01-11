const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const warehouseSchema = mongoose.Schema(
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
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

warehouseSchema.plugin(toJSON);
warehouseSchema.plugin(paginate);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
module.exports = Warehouse;
