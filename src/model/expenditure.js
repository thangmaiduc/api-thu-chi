const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    money: {
        type: Number,
        
       
        required: true
    },
    note: {
        type: String,
        trim: true,
        
       
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


const Expenditure = mongoose.model('Expenditure', Schema)
module.exports = Expenditure