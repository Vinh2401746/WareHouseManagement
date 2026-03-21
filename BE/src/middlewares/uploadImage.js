const fs = require('fs');
const path = require('path');
const multer = require('multer');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const responseMessages = require('../constants/responseMessages');
const config = require('../config/config');

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Chuẩn hoá chuỗi thành slug an toàn cho tên file ảnh
const slugify = (value) => {
  if (!value) {
    return '';
  }
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 60);
};

const buildImageFileName = (req, file, safeExt) => {
  const originalExt = path.extname(file.originalname || '') || safeExt;
  const baseName = path.basename(file.originalname || '', originalExt) || 'product-image';
  const sourceLabel = req.body.code || req.body.name || baseName;
  const slug = slugify(sourceLabel) || 'product-image';
  const uniqueSuffix = Date.now().toString(36);
  return `${slug}-${uniqueSuffix}${safeExt}`;
};

const productImageStorage = multer.diskStorage({
  destination(req, file, cb) {
    const targetDir = path.join(config.file.uploadDir, config.file.productDir);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(targetDir, { recursive: true });
    cb(null, targetDir);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname || '') || '.jpg';
    const safeExt = extension.toLowerCase();
    const filename = buildImageFileName(req, file, safeExt);
    file.relativePath = path.posix.join(config.file.productDir.replace(/\\/g, '/'), filename);
    cb(null, filename);
  },
});

const multerUpload = multer({
  storage: productImageStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter(req, file, cb) {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(new ApiError(httpStatus.BAD_REQUEST, responseMessages.product.imageInvalidType));
      return;
    }
    cb(null, true);
  },
});

const uploadProductImage = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    next();
    return;
  }

  multerUpload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        next(new ApiError(httpStatus.BAD_REQUEST, responseMessages.product.imageTooLarge));
        return;
      }
      next(err);
      return;
    }

    if (req.file && req.file.relativePath) {
      req.file.relativePath = req.file.relativePath.replace(/\\/g, '/');
    }

    next();
  });
};

module.exports = uploadProductImage;
