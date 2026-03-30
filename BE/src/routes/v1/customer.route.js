const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const customerValidation = require('../../validations/customer.validation');
const customerController = require('../../controllers/customer.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(customerValidation.createCustomer), customerController.createCustomer)
  .get(auth(), validate(customerValidation.getCustomers), customerController.getCustomers);

router
  .route('/:customerId')
  .get(auth(), validate(customerValidation.getCustomer), customerController.getCustomer)
  .put(auth(), validate(customerValidation.updateCustomer), customerController.updateCustomer)
  .delete(auth(), validate(customerValidation.deleteCustomer), customerController.deleteCustomer);

module.exports = router;
