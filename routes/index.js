const express = require('express');
const router = express.Router();

router.use('/api', require('./api'));

router.use('/payment', require('./api/payment'));
router.use('/transaction', require('./api/transaction'));
module.exports = router;