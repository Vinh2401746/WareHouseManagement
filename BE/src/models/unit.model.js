const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const unitSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
unitSchema.plugin(toJSON);
unitSchema.plugin(paginate);

/**
 * @typedef Unit
 */
const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
