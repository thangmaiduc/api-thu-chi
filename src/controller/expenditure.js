const {
  getDay,
  getMonthCur,
  getMonthNext,
  getYearCur,
  getYearNext,
} = require("../util/handleDate");

const Expenditure = require("../model/expenditure");

var {validationResult} = require('express-validator');
const createExpenditute = async (req, res, next) => {
  try {
    
    const errors = validationResult(req);
      
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const khoanchi = new Expenditure({ ...req.body, owner: req.user._id });

    await khoanchi.save();
    res.status(201).json(khoanchi);
  } catch (error) {
    
    next(error);
  }
};

const getExpendituteInRange = async (req, res, next) => {
  const fromdate = req.params.fromdate;
  const todate = req.params.todate;
  console.log(fromdate, todate);

  try {
    const chi = await Expenditure.find({
      owner: req.user._id,
      date: {
        $gte: fromdate /*  */,
        $lte: todate,
      },
    });
    res.status(200).json(chi);
  } catch (error) {
    
    next(error);
  }
};
const getExpendituteInDay = async (req, res, next) => {
  const mydate = req.params.date;

  try {
    const chi = await Expenditure.find({
      owner: req.user._id,
      date: { $gte: mydate, $lt: getDay(mydate) },
    });
    res.status(200).json(chi);
  } catch (error) {
    
    next(error);
  }
};

const getExpendituteInMonth = async (req, res, next) => {
  const mydate = req.params.date;
  console.log(getMonthNext(mydate));
  console.log(getMonthCur(mydate));
  try {
    const chi = await Expenditure.find({
      owner: req.user._id,
      date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
    });
    res.status(200).json(chi);
  } catch (error) {
    
    next(error);
  }
};

const getExpendituteInYear = async (req, res, next) => {
  const mydate = req.params.date;
  console.log(getYearNext(mydate));
  console.log(getYearCur(mydate));
  try {
    const chi = await Expenditure.find({
      owner: req.user._id,
      date: { $gte: getYearCur(mydate), $lt: getYearNext(mydate) },
    });
    res.status(200).json(chi);
  } catch (error) {
    
    next(error);
  }
};

const updateExpenditure = async (req, res, next) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowsUpdate = ["money", "note", "group", "date"];

  const isValidUpdate = updates.every((update) =>
    allowsUpdate.includes(update)
  );

  

  try {
    if (!isValidUpdate){
      const err= new Error('Thay đổi không hợp lệ"');
      err.statusCode= 400;
      throw err;
    } 
    const chi = await Expenditure.findOne({ _id, owner: req.user._id });
    if (!chi) {
      const err= new Error('Không thấy khoảng chi');
      err.statusCode= (404);
      throw err;
    }
    updates.forEach((update) => (chi[update] = req.body[update]));
    await chi.save();
    res.json(chi);
  } catch (error) {
    

    next(error);
  }
};

const deleteExpenditure = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const chi = await Expenditure.findOneAndDelete({ _id, owner: req.user._id });
    if (!chi) {
      const err= new Error('Không thấy khoảng chi');
      err.statusCode= (404);
      throw err;
    } 
    res.status(200).send(chi);
  } catch (error) {
    
    next(error);
  }
};

module.exports = {
  createExpenditute,getExpendituteInRange,getExpendituteInDay,getExpendituteInMonth,getExpendituteInYear,updateExpenditure,deleteExpenditure
};
