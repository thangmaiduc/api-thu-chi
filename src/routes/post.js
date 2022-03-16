var express = require('express');

const {getMonth} = require('../controller/post')
var router = express.Router();

/* GET users listing. */

router.get('/thang/:date',getMonth )

module.exports = router;