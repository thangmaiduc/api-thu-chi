const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } }

    // After 5 minutes it deleted automatically from the database
}, { timestamps: true })
const OTP = mongoose.model('OTP', schema)
module.exports = OTP