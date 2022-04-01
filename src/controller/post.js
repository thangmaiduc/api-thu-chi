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
 /* #swagger.parameters['date'] = { 
      description: 'a date in month then determine which month.' ,
      require: true
    } */
  // #swagger.description = 'Endpoint to get all receipts,  expenditures and total revenue, cost in a month.'
  
        /* #swagger.responses[200] = { 
               schema:{
                "receipts":[{ $ref: '#/definitions/expenditures'}],
                 "expenditures":[{ $ref: '#/definitions/receipts'}],
                 tongThu: 10000000,
                 tongChi: 3000000
               },
               description: 'successful.' 
        } */
  try {
    const expenditures = await Expenditure.find({
      owner: req.user._id,
      date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
    });
    const receipts = await Receipts.find({
      owner: req.user._id,
      date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
    });
    if (!receipts && !expenditure) {
      const err = new Error("Không thấy khoảng thu hoặc chi nào ");
      err.statusCode = 404;
      throw err;
    }
    let tongThu = receipts.reduce((tongThu, receipts) => {
      return (tongThu += receipts.money);
    }, 0);
    let tongChi = expenditures.reduce((tongChi, expenditures) => {
      return (tongChi += expenditures.money);
    }, 0);
    const data = { receipts, expenditures, tongThu, tongChi };
    console.log();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
   // #swagger.parameters['id'] = { description: 'Receipts ID or Expenditure ID.' }
  // #swagger.description = 'Endpoint to get a receipts or a expenditure.'
  
        /* #swagger.responses[200] = { 
               schema:{
                 $ref: '#/definitions/expenditures'
               },
               description: 'successful.' 
        } */
  try {
    const _id = req.params.id;
    let receipts = await Receipts.findById(_id);
    let expenditure = await Expenditure.findById(_id);
    if (!receipts && !expenditure) {
        const err = new Error("Không thấy khoảng receipts hoặc expenditure ");
        err.statusCode = 404;
        throw err;
      }
    !receipts ? res.json({ expenditure }) : res.json({ receipts });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  /*  #swagger.parameters['addPost'] = {
                in: 'body',
                description: 'add a receipts or a expenditure',
                schema: {
                    $ref : '#/definitions/addPost'
                }
        } */
  // #swagger.description = 'Endpoint to get all receipts,  expenditures and total revenue, cost in a month.'
  //#swagger.responses[422] ={description: 'Validation failed.' }
        /* #swagger.responses[201] = { 
               
               description: 'successful.' 
        } */
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
      if( type==='chi')
        post = new Expenditure({ ...req.body, owner: req.user._id })
      else if( type==='thu')
        post = new Receipts({ ...req.body, owner: req.user._id });
      
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      
      next(error);
    }
  };
  
const updatePost = async (req, res, next) => {
  // #swagger.description = 'Endpoint to update a post.'
  // #swagger.parameters['id'] = { description: 'Receipts ID or Expenditure ID.' }
  /* #swagger.parameters['editPost'] = {
           in: 'body',
           description: 'Post information need edit.',
           
           schema: { $ref: "#/definitions/editPost" }
    } */
  //#swagger.responses[422] ={description: 'Validation failed.' }
  /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/receipts",
              $ref: "#/definitions/expenditures" },
               description: 'successful.' 
        } */
    const errors = validationResult(req);
        
      if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
      }
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
      const expenditure = await Expenditure.findOne({ _id, owner: req.user._id });
      const receipts = await Receipts.findOne({ _id, owner: req.user._id });
      if (!expenditure && !receipts) {
        const err = new Error("Không thấy khoảng receipts hoặc expenditure cần sửa");
        err.statusCode = 404;
        throw err;
      }
      if (expenditure) {
        updates.forEach((update) => (expenditure[update] = req.body[update]));
        await expenditure.save();
        res.json({ expenditure });
      } else if (receipts) {
        updates.forEach((update) => (receipts[update] = req.body[update]));
        await receipts.save();
        res.json({ receipts });
      }
    } catch (error) {
      next(error);
    }
  };
const deletePost = async (req, res, next) => {
  // #swagger.description = 'Endpoint to update a post.'
  // #swagger.parameters['id'] = { description: 'Receipts ID or Expenditure ID.' }
  
  
  /* #swagger.responses[204] = { 
             
               description: 'delete successfully.' 
        } */
  const _id = req.params.id;
  try {
    const expenditure = await Expenditure.findOneAndDelete({
      _id,
      owner: req.user._id,
    });
    const receipts = await Receipts.findOneAndDelete({ _id, owner: req.user._id });
    if (!chi && !thu) {
      const err = new Error("Không thấy khoảng thu hay chi");
      err.statusCode = 404;
      throw err;
    }
     res.status(204).send()
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
