const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const warehouseTransferValidation = require('../../validations/warehouseTransfer.validation');
const warehouseTransferController = require('../../controllers/warehouseTransfer.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('createWarehouseTransfers'),
    validate(warehouseTransferValidation.createWarehouseTransfer),
    warehouseTransferController.createWarehouseTransfer
  )
  .get(
    auth('getWarehouseTransfers'),
    validate(warehouseTransferValidation.getWarehouseTransfers),
    warehouseTransferController.getWarehouseTransfers
  );

router
  .route('/:warehouseTransferId')
  .get(
    auth('getWarehouseTransfers'),
    validate(warehouseTransferValidation.getWarehouseTransfer),
    warehouseTransferController.getWarehouseTransfer
  );

router
  .route('/:warehouseTransferId/approve')
  .patch(
    auth('manageWarehouseTransfers'),
    validate(warehouseTransferValidation.approveWarehouseTransfer),
    warehouseTransferController.approveWarehouseTransfer
  );

router
  .route('/:warehouseTransferId/cancel')
  .put(
    auth('createWarehouseTransfers'),
    validate(warehouseTransferValidation.cancelWarehouseTransfer),
    warehouseTransferController.cancelWarehouseTransfer
  );

module.exports = router;
