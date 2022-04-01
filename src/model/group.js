const mongoose = require("mongoose");
const { schema } = require("./user");
const Schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  color: {
    type: String,
    trim: true,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
},{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});
Schema.virtual('receipts', {
    ref: 'Receipts',
    localField: '_id',
    foreignField: 'group'
})
Schema.virtual('expenditures', {
    ref: 'Expenditure',
    localField: '_id',
    foreignField: 'group'
})
Schema.methods.toJSON = function(){
  
  object = this.toObject();

  delete object.__v;
  delete object.id;
  delete object.owner
  

  return object;
}
const Group = mongoose.model("Group", Schema);
module.exports = Group;
