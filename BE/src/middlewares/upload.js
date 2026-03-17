const multer = require('multer');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (EXCEL_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Chỉ hỗ trợ file Excel (.xlsx, .xls)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
