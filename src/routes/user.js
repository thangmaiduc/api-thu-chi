var express = require('express');
var User = require('../model/user');

var router = express.Router();

/* GET users listing. */
router.post('/login', function(req, res, next) {
  const { email, password } = req.body;
  res.status(200).json( { email, password });

});

module.exports = router;
