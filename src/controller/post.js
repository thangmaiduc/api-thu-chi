const {
    getDay,
    getMonthCur,
    getMonthNext,
    getYearCur,
    getYearNext,
  } = require("../util/handleDate");
  
var Expenditure = require('../model/expenditure');
var Receipts = require("../model/receipts");

 const getMonth = async (req, res, next) => {
    const mydate = req.params.date;
    console.log(getMonthNext(mydate));
    console.log(getMonthCur(mydate));
    try {
      const chi = await Expenditure.find({
        owner: req.user._id,
        date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
      });
      const thu = await Receipts.find({
        owner: req.user._id,
        date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
      });
      let tongThu = thu.reduce((tongThu, thu)=>{
        return tongThu+= thu.money;
      }, 0)
      let tongChi = chi.reduce((tongChi, chi)=>{
        return tongChi+= chi.money;
      }, 0)
      const data = {thu,chi,tongThu,tongChi};
      console.log();
      res.status(200).json(data);
    } catch (error) {
      
      next(error);
    }
  };


  module.exports = {
    getMonth
  };