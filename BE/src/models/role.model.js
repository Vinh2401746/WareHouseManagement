const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ROLE_SCOPES = ['branch', 'global'];

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    scope: {
      type: String,
      enum: ROLE_SCOPES,
      default: 'branch',
    },
    isSystem: {
      type: Boolean,
      default: true,
    },
    isImmutable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
