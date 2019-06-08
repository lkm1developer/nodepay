var fs = require('fs');
var crypto = require('crypto');
var inspect = require('util').inspect;
const auth = require('../auth');
const router = require('express').Router();
var buffersEqual = require('buffer-equal-constant-time');
var ssh2 = require('ssh2');
var utils = ssh2.utils;

router.get('/sshlogin', auth.optional, (req, res, next) => {
    return res.status(200).json({
        status:true,
        data: 'fdh',
    });

});
module.exports = router;