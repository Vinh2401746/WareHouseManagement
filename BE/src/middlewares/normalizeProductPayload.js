const fs = require('fs');
const logger = require('../config/logger');

const STRING_FIELDS = ['code', 'name', 'unit', 'package'];

const removeUploadedFile = async (file) => {
  if (!file || file.cleaned) {
    return;
  }
  file.cleaned = true;
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.promises.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Không thể xoá file ảnh tạm thời: ${error.message}`);
    }
  }
};

const normalizeNumber = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return value;
};

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }
  return value;
};

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const normalizeProductPayload = async (req, res, next) => {
  req.cleanupUploadedFile = () => removeUploadedFile(req.file);

  try {
    req.body = req.body || {};

    STRING_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        const normalized = normalizeString(req.body[field]);
        if (normalized === undefined) {
          delete req.body[field];
        } else {
          req.body[field] = normalized;
        }
      }
    });

    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'minStock')) {
      const normalized = normalizeNumber(req.body.minStock);
      if (normalized === undefined) {
        delete req.body.minStock;
      } else {
        req.body.minStock = normalized;
      }
    }

    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'removeImage')) {
      req.body.removeImage = normalizeBoolean(req.body.removeImage);
    }

    next();
  } catch (error) {
    await removeUploadedFile(req.file);
    next(error);
  }
};

module.exports = normalizeProductPayload;
