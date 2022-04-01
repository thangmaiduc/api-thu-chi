var Group = require("../model/group");
const getGroups = async (req, res, next) => {
  // #swagger.description = 'Endpoint to get all group.'
  //#swagger.responses[404] ={ description : 'not found any group'}
  /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Group" },
               description: 'successful.' 
        } */
   

  try {
    var groups = await Group.find({ owner: req.user._id });
    if (!groups) {
      const err = new Error("Not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
};
const getGroup = async (req, res, next) => {
  // #swagger.parameters['id'] = { description: 'Group ID .' }
  // #swagger.description = 'Endpoint to get all post in a group.'
  
        /* #swagger.responses[200] = { 
               schema:[{
                        _id: "620f63f20f474f81b4fae559",
                        name: "tien tieu vat",
                        color: "red",
                        owner: "6209b5cdca0a9451ce1238c5",
                         "receipts":[{ $ref: '#/definitions/expenditures'}],
                      "expenditures":[{ $ref: '#/definitions/receipts'}]
               }],
               description: 'successful.' 
        } */
  try {
    var group = await Group.findOne({
      owner: req.user._id,
      _id: req.params.id,
    })
      .populate({
        path: "receipts",
        // match:{
        //     money:{$gt: 200000}
        // }
        // options:{limit: 1, skip: 0}
      })
      .populate("expenditures");
    if (!group) {
      const err = new Error("Not found");
      err.statusCode = 404;
      throw err;
    }
    //#swagger.responses[404] ={ description : 'not found any group'}
   
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
};
const createGroup = async (req, res, next) => {
  try {
    // #swagger.description = 'Endpoint to create a group.'
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
  var allowsUpdate = ["color", "name"];
  var _id = req.params.id;
  var updates = Object.keys(req.body);
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
    var group = await Group.findOne({ _id, owner: req.user._id });
    if (!group) {
      const err = new Error("Not found");
      err.statusCode = 404;
      throw err;
    }
    updates.forEach((update) => (group[update] = req.body[update]));
    await group.save();
    res.json(group);
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
      const err = new Error("Not found");
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
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
};
