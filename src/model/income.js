const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    monthYearIncome: {
        type: Date,
        require: true,
        unique:true,
        default: Date.now()
    },
    totalIncome: {
        type: Number,
        default: 0,
        required: true
    }
}, { timestamps: true })
const Income = mongoose.model('Income', schema)
module.exports = Income