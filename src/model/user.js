const mongoose = require("mongoose")

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 250,
        required: true
    },
    avatar: {
        type: String,
        trim: true,
        default:''
    },
    cloudinary_id: {
        type: String,
        trim: true,
        default:''
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        maxlength: 250,
        lowercase: true,
        
    },
    resetLink:{
        type: String,
        default:''
        
    },
    isAuthOTP:{
        type: Boolean,
        default: false
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        maxlength: 250,
        
    }
})
// userSchema.virtual('tasks', {
//     ref: 'Task',
//     localField: '_id',
//     foreignField: 'owner'
// })

userSchema.methods.toJSON = function(){
    user = this;
    userObject = user.toObject();

    delete userObject.password;
    

    return userObject;
}
userSchema.methods.isMatch=async function(oldPassword){
    user =this;
    console.log(oldPassword, user.password);
    const isMatch=await bcrypt.compare(oldPassword,user.password)
        return isMatch;

}
userSchema.statics.findByCredentials= async (email, password)=>{
    
    user = await User.findOne({email})
    if(!user){
        const err = new Error('Email hoặc mật khẩu không hợp lệ' );
        err.statusCode=401;
        
        throw err;
        
    }
    
    const isMatch=await bcrypt.compare(password,user.password)
    
    if(!isMatch){
        const err = new Error('Email hoặc mật khẩu không hợp lệ' );
        err.statusCode=(401);
        
        throw err;
        
    }
    return user;
}

userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password'))
    {
        user["password"] = await bcrypt.hash(user["password"], 8);
        
    } 
    next();

  
})
// userSchema.pre('remove', async function(next){
//     const user = this
//     await Task.deleteMany({owner : user._id})

//     next()
// } )



const User = mongoose.model('User', userSchema)
module.exports = User
