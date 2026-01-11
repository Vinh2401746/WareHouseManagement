const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

branchSchema.plugin(toJSON);
branchSchema.plugin(paginate);

const Branch = mongoose.model('Branch', branchSchema);
module.exports = Branch;
