const {
  getDay,
  getMonthCur,
  getMonthNext,
  getYearCur,
  getYearNext,
} = require("../util/handleDate");
const fs = require("fs");
var Expenditure = require("../model/expenditure");
var Group = require("../model/group");
var Receipts = require("../model/receipts");
var { buildPdf } = require("../util/pdf-services");
var { validationResult } = require("express-validator");
const getPostAMonthDate = async (req, res, next) => {
  const mydate = req.params.date;

  
  // #swagger.description = 'Endpoint to get all receipts,  expenditures group by date in a month.'

  /* #swagger.responses[200] = { 
              
               description: 'successful.' 
        } */
  try {
    let aggregate = [
      {
        $match: {
          owner: req.user._id,
          date: {
            $gte: getMonthCur(mydate),
            $lt: getMonthNext(mydate),
          },
        },
      },
      {
        $unionWith: {
          coll: "receipts",
          pipeline: [
            {
              $match: {
                owner: req.user._id,
                date: {
                  $gte: getMonthCur(mydate),
                  $lt: getMonthNext(mydate),
                },
              },
            },
          ],
        },
      },

      {
        $group: {
          _id: {
            date: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" },
            postId: "$_id",
            money: "$money",
            note: "$note",
            groupId: "$group",
          },
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id.groupId",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $project: {
          color: "$group.color",
          group_name: "$group.name",
          type: "$group.type",
        },
      },
      {
        $unwind: "$group_name",
      },
      {
        $unwind: "$color",
      },
      {
        $unwind: "$type",
      },
      {
        $group: {
          _id: {
            date: "$_id.date",
            month: "$_id.month",
            year: "$_id.year",
          },
          post: {
            $push: {
              id: "$_id.postId",
              money: "$_id.money",
              note: "$_id.note",
              group: "$group_name",
              color: "$color",
              type: "$type",
            },
          },
        },
      },

      {
        $sort: {
          _id: -1,
        },
      },
    ];
    const expenditures = await Expenditure.aggregate(aggregate).exec();
    // const receipts = await Receipts.aggregate(aggregate).exec();

    // if (!receipts && !expenditure) {
    //   const err = new Error("Kh??ng th???y kho???ng thu ho???c chi n??o ");
    //   err.statusCode = 404;
    //   throw err;
    // }
    expenditures.forEach((data) => {
      data.date = new Date(data._id.year, data._id.month - 1, data._id.date);
      data.date.setMinutes(
        data.date.getMinutes() - data.date.getTimezoneOffset()
      );
      data._id = data._id.date;
      data.tongThu = data.post.reduce((tongThu, post) => {
        if (post.type === "thu") return (tongThu += post.money);
        return tongThu;
      }, 0);
      // console.log(tongThu);
      data.tongChi = data.post.reduce((tongChi, post) => {
        if (post.type === "chi") return (tongChi += post.money);
        return tongChi;
      }, 0);
      // console.log(tongChi);
    });

    // const data = { receipts, expenditures, tongThu, tongChi };

    console.log();
    res.status(200).json(expenditures);
  } catch (error) {
    next(error);
  }
};
const exportPdf = async (req, res, next) => {
  const { dateStart, dateEnd } = req.params;

  
  // #swagger.description = 'Endpoint to export revenue and expenditure in range from dateStart to dateEnd.'

  
        console.log(getDay(dateStart));
        console.log(getDay(dateEnd));
  try {
    let aggregate = [
      {
        $match: {
          owner: req.user._id,
          date: {
            $gte: getDay(dateStart),
            $lt: getDay(dateEnd),
          },
        },
      },
      {
        $unionWith: {
          coll: "receipts",
          pipeline: [
            {
              $match: {
                owner: req.user._id,
                date: {
                  $gte: getDay(dateStart),
                  $lt: getDay(dateEnd),
                },
              },
            },
          ],
        },
      },

      {
        $group: {
          _id: {
            date: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" },
            postId: "$_id",
            money: "$money",
            note: "$note",
            groupId: "$group",
          },
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id.groupId",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $project: {
          color: "$group.color",
          group_name: "$group.name",
          type: "$group.type",
        },
      },
      {
        $unwind: "$group_name",
      },
      {
        $unwind: "$color",
      },
      {
        $unwind: "$type",
      },
      {
        $group: {
          _id: {
            date: "$_id.date",
            month: "$_id.month",
            year: "$_id.year",
          },
          post: {
            $push: {
              id: "$_id.postId",
              money: "$_id.money",
              note: "$_id.note",
              group: "$group_name",
              color: "$color",
              type: "$type",
            },
          },
        },
      },

      {
        $sort: {
          _id: -1,
        },
      },
    ];
    const expenditures = await Expenditure.aggregate(aggregate).exec();

    expenditures.forEach((data) => {
      data.date = new Date(data._id.year, data._id.month - 1, data._id.date);
      data.date.setMinutes(
        data.date.getMinutes() - data.date.getTimezoneOffset()
      );
    });

    // const stream = res.writeHead(200, {
    //   'Content-Type': 'application/pdf',
    //   'Content-Disposition': `attachment;filename=invoice.pdf`,
    // });
    var finalString = ""; // contains the base64 string
    buildPdf(
      expenditures,function() {
        console.log(expenditures);
        // read pdf file as base64
        fs.readFile('output.pdf', 'base64', function(err, data) {
        if (err) throw err;
        // console.log(data);
      
        // Send base64 pdf to client
          res.status(200).json(data);
      });
      }
    );
    // let finalString =await buildPdf(expenditures)
    // console.log(finalString);
    // res.status(200).json(finalString)
  } catch (error) {
    next(error);
  }
};
const getPostByMonth = async (req, res, next) => {
  const mydate = req.params.date;
  /* #swagger.parameters['date'] = { 
      description: 'a date in month then determine which month.' ,
      require: true
    } */
  // #swagger.description = 'Endpoint to statistics of revenue and expenditure in a month.'

  /* #swagger.responses[200] = { 
              
               description: 'successful.' 
        } */
  try {
    let aggregate = [
      {
        $match: {
          owner: req.user._id,
          date: {
            $gte: getMonthCur(mydate),
            $lt: getMonthNext(mydate),
          },
        },
      },
      {
        $group: {
          _id: "$group",
          totalMoney: { $sum: "$money" },
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "_id",
          as: "group",
        },
      },

      {
        $project: {
          totalMoney: 1,
          group_name: "$group.name",
          group_color: "$group.color",
        },
      },
      {
        $unwind: "$group_name",
      },

      {
        $unwind: "$group_color",
      },
      {
        $sort: {
          totalMoney: -1,
        },
      },
    ];
    const expenditures = await Expenditure.aggregate(aggregate).exec();
    const receipts = await Receipts.aggregate(aggregate).exec();

    if (!receipts && !expenditure) {
      const err = new Error("Kh??ng th???y kho???ng thu ho???c chi n??o ");
      err.statusCode = 404;
      throw err;
    }
    let tongThu = receipts.reduce((tongThu, receipts) => {
      return (tongThu += receipts.totalMoney);
    }, 0);
    let tongChi = expenditures.reduce((tongChi, expenditures) => {
      return (tongChi += expenditures.totalMoney);
    }, 0);
    expenditures.forEach((exp) => {
      if (tongChi === 0) {
        exp.ratio = 0;
        return;
      }
      exp.ratio = (exp.totalMoney / tongChi).toFixed(3);
    });
    receipts.forEach((rec) => {
      if (tongThu === 0) {
        exp.ratio = 0;
        return;
      }
      rec.ratio = (rec.totalMoney / tongThu).toFixed(3);
    });
    const data = { receipts, expenditures, tongThu, tongChi };
    console.log();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
const getMonth = async (req, res, next) => {
 
  // #swagger.description = 'Endpoint to get all month which contain any post.'

  /* #swagger.responses[200] = { 
              
               description: 'successful.' 
        } */
  try {
    const aggregate = [
      [
        {
          $match: {
            owner: req.user._id,
          },
        },
        {
          $project: {
            month: {
              $month: "$date",
            },
            year: {
              $year: "$date",
            },
          },
        },

        {
          $unionWith: {
            coll: "receipts",
            pipeline: [
              {
                $match: {
                  owner: req.user._id,
                },
              },
              {
                $project: {
                  month: {
                    $month: "$date",
                  },
                  year: {
                    $year: "$date",
                  },
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: {
              month: "$month",
              year: "$year",
            },
          },
        },
        {
          $project: {
            year: "$_id.year",
            month: "$_id.month",

            _id: 0,
          },
        },
        {
          $sort: {
            year: -1,
            month: -1,
          },
        },
      ],
    ];
    const monthYear = await Expenditure.aggregate(aggregate).exec();
    // const receipts = await Receipts.aggregate(aggregate).exec();
    monthYear.map((mY) => {
      mY.month_year = new Date(
        Date.UTC(mY.year, mY.month - 1, 1)
      ).toISOString();
    });
    let data = monthYear.reduce((outData, objMonthYear) => {
      return outData.concat(objMonthYear.month_year);
    }, []);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  // #swagger.description = 'Endpoint to get all receipts or a expenditure of a user'

  /* #swagger.responses[200] = { 
               schema:{
                 $ref: '#/definitions/expenditures'
               },
               description: 'successful.' 
        } */
  try {
    let receipts = await Receipts.find({owner: req.user._id});
    let expenditure = await Expenditure.find({owner: req.user._id});
   
     res.json({thu:receipts,chi: expenditure });
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
      const err = new Error("Kh??ng th???y kho???ng receipts ho???c expenditure ");
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
  // #swagger.description = 'Create a post.'
  //#swagger.responses[422] ={description: 'Validation failed.' }
  /* #swagger.responses[201] = { 
               
               description: 'successful.' 
        } */
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("D??? li???u nh???p v??o kh??ng h???p l???");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const type = req.body.type;
    delete req.body.type;
    let post;
    let group = await Group.findOne(
      { _id: req.body.group },
      { type: 1 }
    );
    if (group.type !== type) {
      let arr = [];
      const err = new Error("D??? li???u nh???p v??o kh??ng h???p l???");
      let param = {
        msg: "Kh??ng t??m th???y nh??m",
        param: "group",
      };
      err.data = [...arr, param];
      err.statusCode = 422;
      throw err;
    }
    req.body.date && (date = new Date(req.body.date));
    // console.log(req.body.date);
    // console.log(date);
    console.log(req.user._id);
    if (type === "chi")
      post = new Expenditure({ ...req.body, owner: req.user._id, date });
    else if (type === "thu")
      post = new Receipts({ ...req.body, owner: req.user._id, date });

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
    const error = new Error("D??? li???u nh???p v??o kh??ng h???p l???.");
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
      const err = new Error('Thay ?????i kh??ng h???p l???"');
      err.statusCode = 400;
      throw err;
    }
    const expenditure = await Expenditure.findOne({ _id, owner: req.user._id });
    const receipts = await Receipts.findOne({ _id, owner: req.user._id });
    if (!expenditure && !receipts) {
      const err = new Error("Kh??ng th???y kho???ng thu ho???c chi c???n s???a");
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
    const receipts = await Receipts.findOneAndDelete({
      _id,
      owner: req.user._id,
    });
    if (!expenditure && !receipts) {
      const err = new Error("Kh??ng th???y kho???ng thu hay chi");
      err.statusCode = 404;
      throw err;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getPosts,
  getPostByMonth,
  getMonth,
  updatePost,
  getPost,
  deletePost,
  createPost,
  getPostAMonthDate,
  exportPdf,
};
