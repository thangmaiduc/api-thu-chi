var express = require('express');
var usersRouter = require('./user');
var {authUser} = require('../middlewave/auth');
var router = express.Router();
/* GET home page. */

router.use(authUser)

router.use('/users', usersRouter);
router.get('/',(req,res)=>{
  try {
    res.status(200).json({status:"ok"})
  } catch (error) {
    res.status(401).json({status:"err"})
  }
  
})

module.exports = router;
