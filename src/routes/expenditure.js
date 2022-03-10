var express = require('express');

var Expenditure = require('../model/expenditure');
var {createExpenditute,getExpendituteInRange, getExpendituteInDay, getExpendituteInMonth, getExpendituteInYear,updateExpenditure,deleteExpenditure} = require('../controller/expenditure')
var router = express.Router();
const {validate} =  require('../middlewave/validation')

router.post('/', validate.validatePostBoth() ,createExpenditute );
  
  

  router.get('/khoang/:fromdate/:todate/',getExpendituteInRange)
  router.get('/ngay/:date', getExpendituteInDay)

  router.get('/thang/:date',getExpendituteInMonth)

  router.get('/nam/:date', getExpendituteInYear)
  router.patch('/:id', updateExpenditure)
  router.delete('/:id', deleteExpenditure)

module.exports = router;