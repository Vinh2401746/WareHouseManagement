const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');
const customerValidation = require('../../validations/customer.validation');
const customerController = require('../../controllers/customer.controller');

const router = express.Router();

// ─── Excel Import / Export (phải đặt TRƯỚC /:customerId) ───────────────────

router.get('/import-template', auth('getCustomers'), customerController.getImportTemplate);

router.post('/import', auth('manageCustomers'), upload.single('file'), customerController.importCustomers);

router.get('/export', auth('getCustomers'), validate(customerValidation.exportCustomers), customerController.exportCustomers);

router
  .route('/')
  .post(auth('manageCustomers'), validate(customerValidation.createCustomer), customerController.createCustomer)
  .get(auth('getCustomers'), validate(customerValidation.getCustomers), customerController.getCustomers);

router
  .route('/:customerId')
  .get(auth('getCustomers'), validate(customerValidation.getCustomer), customerController.getCustomer)
  .put(auth('manageCustomers'), validate(customerValidation.updateCustomer), customerController.updateCustomer)
  .delete(auth('manageCustomers'), validate(customerValidation.deleteCustomer), customerController.deleteCustomer);

module.exports = router;
