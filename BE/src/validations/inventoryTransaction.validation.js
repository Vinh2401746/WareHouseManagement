const Joi = require('joi');
const { objectId } = require('./custom.validation');

const importInventoryBody = Joi.object().keys({
  warehouse: Joi.string().required().custom(objectId).messages({
    'any.required': 'Mã kho là bắt buộc',
    'string.base': 'Mã kho phải là chuỗi',
  }),
  supplier: Joi.string().required().custom(objectId).messages({
    'any.required': 'Nhà cung cấp là bắt buộc',
    'string.base': 'Nhà cung cấp phải là chuỗi',
  }),
  reason: Joi.string().messages({
    'string.base': 'Lý do phải là chuỗi',
  }),
  deliveryPerson: Joi.string().messages({
    'string.base': 'Người giao hàng phải là chuỗi',
  }),
  transactionDate: Joi.date().messages({
    'date.base': 'Ngày giao dịch phải là ngày hợp lệ',
  }),
  totalAmount: Joi.number().min(0).messages({
    'number.base': 'Tổng tiền hàng phải là số',
    'number.min': 'Tổng tiền hàng phải lớn hơn hoặc bằng 0',
  }),
  discountMoney: Joi.number().min(0).default(0).messages({
    'number.base': 'Tiền chiết khấu phải là số',
    'number.min': 'Tiền chiết khấu phải lớn hơn hoặc bằng 0',
  }),
  taxMoney: Joi.number().min(0).default(0).messages({
    'number.base': 'Tiền thuế phải là số',
    'number.min': 'Tiền thuế phải lớn hơn hoặc bằng 0',
  }),
  totalAmountAfterFax: Joi.number().min(0).messages({
    'number.base': 'Tổng tiền sau thuế phải là số',
    'number.min': 'Tổng tiền sau thuế phải lớn hơn hoặc bằng 0',
  }),
  items: Joi.array()
    .items(
      Joi.object().keys({
        productCode: Joi.string().required().messages({
          'any.required': 'Mã sản phẩm là bắt buộc',
          'string.base': 'Mã sản phẩm phải là chuỗi',
        }),
        productName: Joi.string().required().messages({
          'any.required': 'Tên sản phẩm là bắt buộc',
          'string.base': 'Tên sản phẩm phải là chuỗi',
        }),
        unit: Joi.string().required().custom(objectId).messages({
          'any.required': 'Đơn vị tính là bắt buộc',
          'string.base': 'Đơn vị tính phải là chuỗi',
        }),
        packaging: Joi.string().allow('').messages({
          'string.base': 'Đóng gói phải là chuỗi',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'any.required': 'Số lượng là bắt buộc',
          'number.base': 'Số lượng phải là số',
          'number.integer': 'Số lượng phải là số nguyên',
          'number.min': 'Số lượng phải lớn hơn hoặc bằng 1',
        }),
        price: Joi.number().min(0).required().messages({
          'any.required': 'Giá là bắt buộc',
          'number.base': 'Giá phải là số',
          'number.min': 'Giá phải lớn hơn hoặc bằng 0',
        }),
        taxRate: Joi.number().min(0).messages({
          'number.base': 'Thuế suất phải là số',
          'number.min': 'Thuế suất phải lớn hơn hoặc bằng 0',
        }),
        discountRate: Joi.number().min(0).messages({
          'number.base': 'Chiết khấu (%) phải là số',
          'number.min': 'Chiết khấu (%) phải lớn hơn hoặc bằng 0',
        }),
        totalAmount: Joi.number().min(0).messages({
          'number.base': 'Thành tiền phải là số',
          'number.min': 'Thành tiền phải lớn hơn hoặc bằng 0',
        }),
        expiryDate: Joi.date().required().messages({
          'any.required': 'Ngày hết hạn là bắt buộc',
          'date.base': 'Ngày hết hạn phải là ngày hợp lệ',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'items là bắt buộc',
      'array.base': 'items phải là một mảng',
      'array.min': 'items phải chứa ít nhất 1 phần tử',
    }),
});

const createInventoryTransaction = {
  body: Joi.object().keys({
    type: Joi.string(),
    reason: Joi.string(),
    warehouse: Joi.string(),
    supplier: Joi.string(),
    sale: Joi.string(),
    createdBy: Joi.string(),
    transactionDate: Joi.date(),
    items: Joi.string(),
  }),
};

const getInventoryTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid('IMPORT', 'EXPORT'),
    reason: Joi.string(),
    warehouse: Joi.custom(objectId),
    supplier: Joi.custom(objectId),
    sale: Joi.custom(objectId),
    createdBy: Joi.custom(objectId),
    transactionDate: Joi.date(),
    deliveryPerson: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getInventoryTransaction = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.string().custom(objectId),
  }),
};

const updateInventoryTransaction = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.required().custom(objectId),
  }),
  body: importInventoryBody,
};

const deleteInventoryTransaction = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.string().custom(objectId),
  }),
};

const importInventory = {
  body: importInventoryBody,
};

const confirmImport = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.string().required().custom(objectId).messages({
      'any.required': 'Mã phiếu nhập là bắt buộc',
    }),
  }),
};

const cancelImport = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.string().required().custom(objectId).messages({
      'any.required': 'Mã phiếu nhập là bắt buộc',
    }),
  }),
  body: Joi.object().keys({
    cancelReason: Joi.string().messages({
      'string.base': 'Lý do hủy phải là chuỗi',
    }),
  }),
};

const changeImportStatus = {
  params: Joi.object().keys({
    inventoryTransactionId: Joi.string().required().custom(objectId).messages({
      'any.required': 'Mã phiếu nhập là bắt buộc',
    }),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('PENDING', 'COMPLETED', 'CANCELED').messages({
      'any.required': 'Trạng thái là bắt buộc',
      'any.only': 'Trạng thái chỉ nhận PENDING, COMPLETED hoặc CANCELED',
    }),
  }),
};

module.exports = {
  createInventoryTransaction,
  getInventoryTransactions,
  getInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction,
  importInventory,
  confirmImport,
  cancelImport,
  changeImportStatus,
};
