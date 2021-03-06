const Expenditure = require("../model/expenditure");
var Group = require("../model/group");
const Receipts = require("../model/receipts");
const { getMonthCur, getMonthNext } = require("../util/handleDate");

const getGroupsByMonth = async (req, res, next) => {
  // #swagger.description = 'Endpoint to get all group.'
  //#swagger.responses[404] ={ description : 'not found any group'}
  /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Group" },
               description: 'successful.' 
        } */

  type = req.query.type || "chi";
  mydate = req.params.mydate;
  try {
    var groupsObj = await Group.find({ type, isGeneral: true })
      .sort({ createdAt: 1 })
      .populate({
        path: "expenditures",
        match: {
          owner: req.user._id,
          date: {
            $gte: getMonthCur(mydate),
            $lt: getMonthNext(mydate),
          },
        },
      });
      var groupsObj2 = await Group.find({ type:'thu' })
      .populate({
        path: "receipts",
        match: {
          owner: req.user._id,
          date: {
            $gte: getMonthCur(mydate),
            $lt: getMonthNext(mydate),
          },
        },
      });
    let groups = JSON.parse(JSON.stringify(groupsObj));
    //  console.log(groups);
    let tongThu=0;
    groupsObj2.forEach((group) => {
      totalMoney = group.receipts?.reduce(
        (tongThu, post) => (tongThu += post.money),
        0
      );
      tongThu+= totalMoney
    });
    console.log(tongThu);
    newGroups = groups.map((group) => {
      totalMoney = group.expenditures.reduce(
        (tongChi, post) => (tongChi += post.money),
        0
      );
      if(tongThu===0) ratio = 1
      else ratio = (totalMoney / (tongThu * group.percent)).toFixed(3);
      // console.log(group.percent);
      let newGroup = { ...group, totalMoney, ratio };
      // delete newGroup.expenditures
      return newGroup;
    });

    res.status(200).json(newGroups);
  } catch (error) {
    next(error);
  }
};
const getGroups = async (req, res, next) => {
  // #swagger.description = 'Endpoint to get all group.'
  //#swagger.responses[404] ={ description : 'not found any group'}
  /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Group" },
               description: 'successful.' 
        } */

  // type = req.query.type || "chi";
  try {
    var groupsObj = await Group.find({
      $or: [
        {
          owner: req.user._id,
        },
        {
          isGeneral: true,
        },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(groupsObj);
  } catch (error) {
    next(error);
  }
};
// const getGroup = async (req, res, next) => {
//   // #swagger.parameters['id'] = { description: 'Group ID .' }
//   // #swagger.description = 'Endpoint to get all post in a group.'

//         /* #swagger.responses[200] = {
//                schema:[{
//                         _id: "620f63f20f474f81b4fae559",
//                         name: "tien tieu vat",
//                         color: "red",
//                         owner: "6209b5cdca0a9451ce1238c5",
//                          "receipts":[{ $ref: '#/definitions/expenditures'}],
//                       "expenditures":[{ $ref: '#/definitions/receipts'}]
//                }],
//                description: 'successful.'
//         } */
//   try {
//     var group = await Group.findOne({
//       owner: req.user._id,
//       _id: req.params.id,
//     })
//       .populate({
//         path: "receipts",
//         // match:{
//         //     money:{$gt: 200000}
//         // }
//         // options:{limit: 1, skip: 0}
//       })
//       .populate("expenditures");
//     if (!group) {
//       const err = new Error("Not found");
//       err.statusCode = 404;
//       throw err;
//     }
//     //#swagger.responses[404] ={ description : 'not found any group'}

//     res.status(200).json(group);
//   } catch (error) {
//     next(error);
//   }
// };
const createGroup = async (req, res, next) => {
  try {
    // #swagger.description = 'Endpoint to create a group.'
    let isDulicateName = await Group.find(
      {
        name: new RegExp("^" + req.body.name + "$", "i"),
        owner: req.user._id,
        type: req.body.type,
      },
      { name: 1 }
    );
    if (isDulicateName.length > 0) {
      let arr = [];
      const err = new Error("D??? li???u nh???p v??o kh??ng h???p l???");
      let param = {
        msg: "???? c?? t??n nh??m n??y r???i",
        param: "name",
      };
      err.data = [...arr, param];
      err.statusCode = 422;
      throw err;
    }
    var group = new Group({ ...req.body, owner: req.user._id });
    /* #swagger.parameters['newGroup'] = {
           in: 'body',
           description: 'Group information.',
           required: true,
           schema: { $ref: "#/definitions/addGroup" }
    } */

    await group.save();
    //#swagger.responses[201] ={ description : 'created successfully'}
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};
const updateGroup = async (req, res, next) => {
  let allowsUpdate = ["color", "name", "type"];
  let id = req.params.id;
  let updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) =>
    allowsUpdate.includes(update)
  );
  if (!isValidUpdate) {
    res.status(400).json({ error: "Thay ?????i kh??ng h???p l???" });
    return;
  }
  // #swagger.description = 'Endpoint to update a group.'
  // #swagger.parameters['id'] = { description: 'Group ID.' }
  /* #swagger.parameters['editGroup'] = {
           in: 'body',
           description: 'Group information need edit.',
           
           schema: { $ref: "#/definitions/addGroup" }
    } */
  //#swagger.responses[500] ={ description : 'Error internal server'}
  //#swagger.responses[404] ={ description : 'not found any group to edit'}
  /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Group" },
               description: 'successful.' 
        } */
  try {
    let group = await Group.findOne({ _id: id, owner: req.user._id })
      .populate("expenditures", {
        options: { limit: 1 },
      })
      .populate("receipts", {
        options: { limit: 1 },
      });
    if (!group) {
      const err = new Error("Kh??ng t??m th???y nh??m n??o");
      err.statusCode = 404;
      throw err;
    }
    let arr = [];
    let isDulicateName = await Group.find(
      {
        name: new RegExp("^" + req.body.name + "$", "i"),
        owner: req.user._id,
        type: req.body.type || group.type,
      },
      { name: 1 }
    );
    isDulicateName = isDulicateName.filter((group) => group.id !== id);
    if (isDulicateName.length > 0) {
      const err = new Error("D??? li???u nh???p v??o kh??ng h???p l???");
      let param = {
        msg: "???? c?? t??n nh??m n??y r???i",
        param: "name",
      };
      err.data = [...arr, param];
      err.statusCode = 422;
      throw err;
    }

    if (
      group.expenditures?.length + group.receipts?.length > 0 &&
      req.body.type
    ) {
      const err = new Error("D??? li???u  kh??ng h???p l???");
      let param = {
        msg: "Kh??ng th??? s???a ki???u nh??m khi ???? c?? kho???n thu chi",
        param: "type",
      };
      err.data = [...arr, param];
      err.statusCode = 422;
      throw err;
    }

    updates.forEach((update) => (group[update] = req.body[update]));
    await group.save();
    let { _id, name, color, type } = group;
    res.json({ _id, name, color, type });
  } catch (error) {
    next(error);
  }
};
const deleteGroup = async (req, res, next) => {
  // #swagger.description = 'Endpoint to delete a group.'
  // #swagger.parameters['id'] = { description: 'Group ID.' }
  /* #swagger.parameters['editGroup'] = {
           in: 'body',
           description: 'Group information need edit.',
           
           schema: { $ref: "#/definitions/addGroup" }
    } */
  //#swagger.responses[500] ={ description : 'Error internal server'}
  //#swagger.responses[404] ={ description : 'not found any group to edit'}
  /* #swagger.responses[200] = { 
              
               description: 'successful.' 
        } */
  var _id = req.params.id;
  try {
    let group = await Group.findOne({ _id, owner: req.user._id })
      .populate("expenditures", {
        options: { limit: 1 },
      })
      .populate("receipts", {
        options: { limit: 1 },
      });
    if (!group) {
      const err = new Error("Kh??ng t??m th???y nh??m n??o");
      err.statusCode = 404;
      throw err;
    }
    if (group.expenditures?.length > 0) {
      await Expenditure.deleteMany({ group: _id });
    } else if (group.receipts?.length > 0) {
      await Receipts.deleteMany({ group: _id });
    }
    var groupDel = await Group.findOneAndDelete({ _id, owner: req.user._id });

    res.status(200).send(groupDel);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createGroup,
  // getGroup,
  getGroups,
  getGroupsByMonth,
  updateGroup,
  deleteGroup,
};
