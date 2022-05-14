const mongoose = require("mongoose")
const Income = require('./income')
const Schema = new mongoose.Schema({
    money: {
        type: Number,
        trim: true,
        
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Group'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    date:{
        type: Date,
        require: true,
        immutable: true,
        default: Date.now()
    }
})
// Schema.post('save', async function(next){
//     const receipts= this
//     let incomeMonth =await Income.findOne({$month : {$month : receipts.date}})
//     totalIncome = Income.totalIncome+receipts.money
//     incomeMonth.updateOne({totalIncome })
//     next();

  
// })

Schema.methods.toJSON = function(){
  
    object = this.toObject();
  
    delete object.__v;
    delete object.owner
    
  
    return object;
  }


const Receipts = mongoose.model('Receipts', Schema)

// test 

module.exports = Receipts