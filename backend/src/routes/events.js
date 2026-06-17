const express = require('express');
const router = express.Router();
const { initClient } = require('../events');

router.get('/', (req, res) => {
  initClient(req, res);
});

module.exports = router;
