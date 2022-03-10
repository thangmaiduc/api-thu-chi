var Group = require("../model/group");
const getGroups = async (req, res, next) => {
  try {
    var groups = await Group.find({ owner: req.user._id });
    if (!groups){
      const err= new Error('Not found');
      err.statusCode=404;
      throw err;
    }  
    res.status(200).json(groups);
  } catch (error) {
    next(error)
   
  }
};
const getGroup = async (req, res, next) => {
  try {
    var group = await Group.findOne({
      owner: req.user._id,
      _id: req.params.id,
    }).populate({
        path:'receipts',
        // match:{
        //     money:{$gt: 200000}
        // }
        // options:{limit: 1, skip: 0}
    }).populate('expenditures');
    if (!group) {
      const err= new Error('Not found');
      err.statusCode=404;
      throw err;
    }  
    res.status(200).json(group);
  } catch (error) {
    next(error)
   
  }
};
const createGroup = async (req, res, next) => {
  try {
    var group = new Group({ ...req.body, owner: req.user._id });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    next(error)
   
  }
};
const updateGroup =async (req, res, next) => {
  var allowsUpdate = ["color", "name"];
  var _id = req.params.id;
  var updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) =>
    allowsUpdate.includes(update)
  );
  if (!isValidUpdate) {res.status(400).json({ error: "Thay đổi không hợp lệ" }); return;}
  try {
    var group = await Group.findOne({ _id, owner: req.user._id });
    if (!group) {
      const err= new Error('Not found');
      err.statusCode=404;
      throw err;
    }   updates.forEach((update) => (group[update] = req.body[update]));
    await group.save();
    res.json(group);
  } catch (error) {
    next(error)

    
  }
};
const deleteGroup = async (req, res, next) => {
    var _id = req.params.id;
    try {
      var group = await Group.findOneAndDelete({ _id, owner: req.user._id });
      if (!group) {
        const err= new Error('Not found');
        err.statusCode=404;
        throw err;
      }  
      res.status(200).send(group);
    } catch (error) {
      next(error)
      
    }
  };
  module.exports = {
    createGroup,getGroup,getGroups,updateGroup,deleteGroup
  };
  
