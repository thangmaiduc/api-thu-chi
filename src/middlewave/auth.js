const jwt = require('jsonwebtoken');
const User= require('../model/user');

const authUser = async (req, res, next)=>{
    try {
        const token = req.header('Authorization')&& req.header('Authorization').replace('Bearer ', '');
        if(!token) return res.status(401).json('Access Denied')
        const decode = jwt.verify(token,process.env.JWT_SECRET);
       
        const user =await User.findOne({_id:decode.userId});
        if(!user) throw new Error();
        req.user = user;
        
        next()
    } catch (error) {
        next(error)
    }
    
}
function authRole(role){
    return (req, res, next) =>{
        if(req.user.role !== role)
        {
            return res
            .status(401)
            .send('not allowed');
        }
        next()  
    }    
    
  }


module.exports = {
    authUser,
    authRole
}