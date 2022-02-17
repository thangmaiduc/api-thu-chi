const mongoose = require("mongoose")
const { schema } = require("./user")

const Schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    color: {
        type: String
    }
})

const Group = mongoose.model('Group', Schema)
module.exports = Group