const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/deep', require('./platform'));
//router.use('/test', require('./deep'));

module.exports = router;