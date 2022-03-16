const express = require('express');
const jwt = require("jsonwebtoken");
const User = require('../model/user');
const {validate} = require('../middlewave/validation')
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox960f2edfd4de411ab1a1a844270e0482.mailgun.org';
const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN});
const router = express.Router();
var {validationResult} = require('express-validator');
/* GET users listing. */
router.post('/login', validate.validateLogin(),async function(req, res, next) {
    const { email, password } = req.body
    try {
      const errors = validationResult(req);
      
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
      const user = await User.findByCredentials(email, password)
      const token = jwt.sign({ userId : user._id},process.env.JWT_SECRET,{expiresIn:'3 days'});
      res.setHeader('authToken', token)
      res.status(200).json({ user, token })
    } catch (error) {
      if(!error.status) error.status =500;
      next(error);
    }

});

router.post('/create', validate.validateRegisterUser(), async (req, res,next)=>{
    
    try {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
      }
      const data = {
        from: 'noreply@hello.com',
        to: req.body.email,
        subject: 'Chào mừng bạn!!',
        html: `<h2>Cảm ơn bạn vừa đăng kí tài khoản tại ứng dụng của chúng tôi!</h2>`
      };
      mg.messages().send(data, function (error, body) {
        if(error){
          const err= new Error(body);
          err.statusCode=(400);
          throw err;
        }
        
      });
      const user  = new  User(req.body) ;
      await user.save()
      const token = jwt.sign({ userId : user._id},process.env.JWT_SECRET,{expiresIn:'3 days'});

      res.setHeader('authToken', token)
      res.status(201).json({ user, token })
        
    } catch (error) {
        
        next(error)
    }
})

router.put('/reset-password', async (req,res,next)=>{
  const {resetLink, newPass} = req.body;
  

  try {
    
    if(!resetLink){
      const err= new Error('Không tồn tại token');
      err.statusCode=(401);
      throw err;
    }
    
    const decode = jwt.verify(resetLink,process.env.JWT_SECRET);
   
    
    const user =await User.findOne({resetLink});
    if(!user) {
      const err= new Error('Người dùng với token không tồn tại');
      err.statusCode=(401);
      throw err;
    }
    user.password = newPass;
    await user.save();
    
    res.status(200).json('Cập nhật mật khẩu thành công')
} catch (error) {
  if(error.name ==='TokenExpiredError'){
    const err= new Error('Token hết hạn hoặc không chính xác');
    err.statusCode=401;
    next(err) ;
  }
   else  next(error)
}

})
router.put('/forgot-password', async (req,res,next)=>{
  try {
    const {email} = req.body;
    console.log(email,  req.body);
    const user = await User.findOne({email});
    if(!user ) {
      const err= new Error('Email không tồn tại');
      err.statusCode=(400);
      throw err;
    }
    const token = jwt.sign({ userId : user._id},process.env.JWT_SECRET,{expiresIn:'20m'});
    const data = {
      from: 'noreply@hello.com',
      to: req.body.email,
      subject: 'Đổi mật khẩu!!',
      html: `<h2>Vui lòng click link ở dưới để đổi mật khẩu!</h2>
      <p><a href=''>${process.env.CLIENT_URL}/reset-password/${token}</a></p>`
    };
    mg.messages().send(data, function (error, body) {
      if(error){
        const err= new Error(body);
        err.statusCode=(400);
        throw err;
      }
     
    });
    await user.updateOne({resetLink: token});

    res.json({message:'Link yêu cầu đổi mật khẩu đã gửi tới email của bạn'})

  } catch (error) {
    next(error)
  }

})
module.exports = router;