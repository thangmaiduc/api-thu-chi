const {
  getDay,
  getMonthCur,
  getMonthNext,
  getYearCur,
  getYearNext,
} = require("../util/handleDate");

var Expenditure = require("../model/expenditure");
var Receipts = require("../model/receipts");
var {validationResult} = require('express-validator');
const getMonth = async (req, res, next) => {
  const mydate = req.params.date;

  try {
    const chi = await Expenditure.find({
      owner: req.user._id,
      date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
    });
    const thu = await Receipts.find({
      owner: req.user._id,
      date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
    });
    let tongThu = thu.reduce((tongThu, thu) => {
      return (tongThu += thu.money);
    }, 0);
    let tongChi = chi.reduce((tongChi, chi) => {
      return (tongChi += chi.money);
    }, 0);
    const data = { thu, chi, tongThu, tongChi };
    console.log();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const _id = req.params.id;
    let thu = await Receipts.findById(_id);
    let chi = await Expenditure.findById(_id);
    if (!chi && !thu) {
        const err = new Error("Không thấy khoảng thu hoặc chi ");
        err.statusCode = 404;
        throw err;
      }
    !thu ? res.json({ chi }) : res.json({ thu });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
    try {
      
      const errors = validationResult(req);
        
      if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
      }
      const type =req.body.type;
      delete req.body.type;
      let post;
        type==='chi'?
        post = new Expenditure({ ...req.body, owner: req.user._id }):
        post = new Receipts({ ...req.body, owner: req.user._id });
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      
      next(error);
    }
  };
  
const updatePost = async (req, res, next) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowsUpdate = ["money", "note", "group", "date"];
  
    const isValidUpdate = updates.every((update) =>
      allowsUpdate.includes(update)
    );
    try {
      if (!isValidUpdate) {
        const err = new Error('Thay đổi không hợp lệ"');
        err.statusCode = 400;
        throw err;
      }
      const chi = await Expenditure.findOne({ _id, owner: req.user._id });
      const thu = await Receipts.findOne({ _id, owner: req.user._id });
      if (!chi && !thu) {
        const err = new Error("Không thấy khoảng thu hoặc chi cần sửa");
        err.statusCode = 404;
        throw err;
      }
      if (chi) {
        updates.forEach((update) => (chi[update] = req.body[update]));
        await chi.save();
        res.json({ chi });
      } else if (thu) {
        updates.forEach((update) => (thu[update] = req.body[update]));
        await thu.save();
        res.json({ thu });
      }
    } catch (error) {
      next(error);
    }
  };
const deletePost = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const chi = await Expenditure.findOneAndDelete({
      _id,
      owner: req.user._id,
    });
    const thu = await Receipts.findOneAndDelete({ _id, owner: req.user._id });
    if (!chi && !thu) {
      const err = new Error("Không thấy khoảng chi hay thu");
      err.statusCode = 404;
      throw err;
    }
    !thu ? res.status(200).send(chi) : res.status(200).send(thu);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getMonth,
  updatePost,
  getPost,
  deletePost,
  createPost
};
