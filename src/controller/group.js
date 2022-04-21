var Group = require("../model/group");
const getGroups = async (req, res, next) => {
  // #swagger.description = 'Endpoint to get all group.'
  //#swagger.responses[404] ={ description : 'not found any group'}
  /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Group" },
               description: 'successful.' 
        } */
   

  try {
    var groups = await Group.find({ owner: req.user._id }).sort({createdAt : -1});
    if (!groups) {
      const err = new Error("Không tìm thấy nhóm nào");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json(groups);
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
    let isDulicateName = await Group.find({name:new RegExp('^'+req.body.name+ '$', 'i') , owner: req.user._id, type:req.body.type },{name:1});
    if(isDulicateName.length>0) {
      let arr = []
      const err = new Error('Dữ liệu nhập vào không hợp lệ');
        let param = {
          msg: 'Đã có tên nhóm này rồi', 
          param : 'name'
        }
        err.data = [...arr, param]
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
  let allowsUpdate = ["color", "name", 'type'];
  let id = req.params.id;
  let updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) =>
    allowsUpdate.includes(update)
  );
  if (!isValidUpdate) {
    res.status(400).json({ error: "Thay đổi không hợp lệ" });
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
   
    
    let group = await Group.findOne({ _id:id, owner: req.user._id })
    .populate("expenditures", {
      options:{limit: 1}
    })
    .populate("receipts",{
      options:{limit: 1}
    });
    if (!group) {
      const err = new Error("Không tìm thấy nhóm nào");
      err.statusCode = 404;
      throw err;
    }
    let arr=[]
    let isDulicateName = await Group.find({name:new RegExp('^'+req.body.name+ '$', 'i') , owner: req.user._id, type:req.body.type || group.type },{name:1});
    isDulicateName = isDulicateName.filter( group => group.id !== id)
    if(isDulicateName.length>0) {
      
      const err = new Error('Dữ liệu nhập vào không hợp lệ');
        let param = {
          msg: 'Đã có tên nhóm này rồi', 
          param : 'name'
        }
        err.data = [...arr, param]
        err.statusCode = 422;
        throw err;
    }
   
    if(group.expenditures?.length + group.receipts?.length >0 && req.body.type) {
      const err = new Error('Dữ liệu  không hợp lệ');
        let param = {
          msg: 'Không thể sửa kiểu nhóm khi đã có khoản thu chi', 
          param : 'type'
        }
        err.data = [...arr, param]
        err.statusCode = 422;
        throw err;
     
    }
    
    updates.forEach((update) => (group[update] = req.body[update]));
    await group.save();
    let {_id, name, color, type} = group
    res.json({_id, name, color, type});
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
    var group = await Group.findOneAndDelete({ _id, owner: req.user._id });
    if (!group) {
      const err = new Error("Không tìm thấy nhóm nào");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).send(group);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createGroup,
  // getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
};
