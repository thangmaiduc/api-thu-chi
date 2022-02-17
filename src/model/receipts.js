const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    money: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    note: {
        type: String,
        trim: true,
        unique: true,
        required: true
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
        default: Date.now()
    }
})

const Receipts = mongoose.model('Receipts', Schema)
module.exports = Receipts