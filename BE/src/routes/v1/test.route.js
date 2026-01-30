const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Server is running', description: 'This is a test route to check server status' });
});

module.exports = router;
