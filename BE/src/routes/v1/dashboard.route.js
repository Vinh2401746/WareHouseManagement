const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { dashboardValidation } = require('../../validations');
const { dashboardController } = require('../../controllers');

const router = express.Router();

router
  .route('/overview')
  .get(auth('getDashboard'), validate(dashboardValidation.getOverview), dashboardController.getOverview);

module.exports = router;
