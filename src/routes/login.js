const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const OTPModel = require("../model/otp");
const { validate } = require("../middlewave/validation");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");

const router = express.Router();
var { validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
/* GET users listing. */
router.post(
  "/login",
  validate.validateLogin(),
  async function (req, res, next) {
    const { email, password } = req.body;
    try {
      const errors = validationResult(req);
      // #swagger.description = 'Endpoint to login.'
      //#swagger.responses[422] ={description: 'Validation failed.' }
      //#swagger.responses[401] ={description: 'Unauthorized' }
      /* #swagger.parameters['userCredentials'] = { 
            in: 'body', 
            '@schema': { 
                "required": [ "email", "password"], 
                "properties": { 
                     "email": { 
                        "type": "string", 
                        "maxLength": 250, 
                        "example": "thang@gmail.com" 
                    } ,
                     "password": { 
                        "type": "string", 
                        "minLength": 7, 
                        "maxLength": 250, 
                        "example": "1234567" 
                    } 
                    
                } 
            } 
        } */
      /* #swagger.responses[200] = { 
               
               description: 'successful.' 
        } */

      if (!errors.isEmpty()) {
        const error = new Error("Dữ liệu nhập vào không hợp lệ");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
      }
      const user = await User.findByCredentials(email, password);
      // if(user.isAuthOTP ===false){
      //   let err =new Error('Tài khoản email của bạn chưa được xác thực, vui lòng xác thực ')
      //   err.statusCode= 401;
      //   const OTP = otpGenerator.generate(6, {
      //     digits: true,
         
      //     lowerCaseAlphabets : false,
      //     upperCaseAlphabets  : false,
      //     specialChars : false,
      //   });
      //   const data = {
      //     from: "thang00lata@gmail.com",
      //     to: req.body.email,
      //     subject: "Vui lòng xác thực OTP!!",
      //     html: `<h2>Cảm ơn bạn vừa đăng kí tài khoản tại ứng dụng của chúng tôi!Vui lòng xác thực bằng cách nhập mã : ${OTP}</h2>
             
      //     `,
      //   };
      //   sgMail
      //     .send(data)
      //     .then(() => {
      //       console.log("Email sent");
      //     })
      //     .catch((error) => {
      //       try {
      //         console.log(error);
      //         const err = new Error(error.message);
      //         err.statusCode = 400;
      //         throw err;
      //       } catch (error) {
      //         next(error);
      //       }
      //     });
      //     const otp = new OTPModel({ email: email, otp: OTP });
      // const salt = await bcrypt.genSalt(10);
      // otp.otp = await bcrypt.hash(otp.otp, salt);
      // const result = await otp.save();
      //   throw err
      // }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "3 days",
      });
      res.setHeader("authToken", token);
      res.status(200).json({ user, token });
    } catch (error) {
      if (!error.status) error.status = 500;
      next(error);
    }
  }
);

router.post(
  "/create", // #swagger.description = 'Endpoint to sign up.'
  //#swagger.responses[422] ={description: 'Validation failed.' }
  //#swagger.responses[400] ={description: 'Bad Request' }
  /* #swagger.parameters['newUser'] = { 
            in: 'body', 
            '@schema': { 
                "required": ["name", "email", "password"], 
                "properties": { 
                    "name": { 
                        "type": "string", 
                        "maxLength": 250, 
                        "example": "Thang Mai." 
                    } ,
                     "email": { 
                        "type": "string", 
                        "maxLength": 250, 
                        "example": "thang@gmail.com" 
                    } ,
                     "password": { 
                        "type": "string", 
                        "minLength": 6, 
                        "maxLength": 250, 
                        "example": "1234567" 
                    } 
                } 
            } 
        } */
  validate.validateRegisterUser(),
  async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
     
      const errors = validationResult(req);
      let arr = [];
      if (!errors.isEmpty()) {
        const error = new Error("Dữ liệu nhập vào không hợp lệ");
        error.statusCode = 422;
        error.data = arr = errors.array();
        throw error;
      }
      let checkEmail = await User.find({ email });

      if (checkEmail.length > 0) {
        const err = new Error("Dữ liệu nhập vào không hợp lệ");
        let param = {
          msg: "Email đã được đăng ký, vui lòng chọn email khác",
          param: "email",
        };
        err.data = [...arr, param];
        err.statusCode = 422;
        throw err;
      }
      const OTP = otpGenerator.generate(6, {
        digits: true,
       
        lowerCaseAlphabets : false,
        upperCaseAlphabets  : false,
        specialChars : false,
      });
      const data = {
        from: "thang00lata@gmail.com",
        to: req.body.email,
        subject: "Vui lòng xác thực OTP!!",
        html: `<h2>Cảm ơn bạn vừa đăng kí tài khoản tại ứng dụng của chúng tôi!Vui lòng xác thực bằng cách nhập mã : ${OTP}</h2>
           
        `,
      };
      sgMail
        .send(data)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          try {
            console.log(error);
            const err = new Error(error.message);
            err.statusCode = 400;
            throw err;
          } catch (error) {
            next(error);
          }
        });

      const user = new User({
        name,
        email,
        password,
      });
      await user.save();
      const otp = new OTPModel({ email: email, otp: OTP });
      const salt = await bcrypt.genSalt(10);
      otp.otp = await bcrypt.hash(otp.otp, salt);
      const result = await otp.save();
      // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      //   expiresIn: "3 days",
      // });

      // res.setHeader("authToken", token);
      res
        .status(201)
        .json({
          msg: "Mail đã gửi tới email của bạn, vui lòng nhập mã OTP xác thực để đăng kí thành công ",
          result,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/verify-otp", async (req, res, next) => {
  const { resetLink, newPass } = req.body;
  // #swagger.description = 'Endpoint to verify otp.'
  
  /* #swagger.parameters['verifyotp'] = { 
            in: 'body', 
            '@schema': { 
                "required": ["otp", "email"], 
                "properties": { 
                    "opt": { 
                        "type": "string", 
                        "Length": 6, 
                        "example": "123456" 
                    } ,
                     "email": { 
                        "type": "string", 
                        "maxLength": 250, 
                        "example": "thang@gmail.com" 
                    } 
                     
                } 
            } 
        } */
  //#swagger.responses[401] ={description: 'Unauthorized' }
  //#swagger.responses[400] ={description: 'Bad Request' }
  try {
    const {email, otp} = req.body
    let otpHolder
    if(email)
     otpHolder = await OTPModel.find({email})
    if (otpHolder.length === 0){
      let err = new Error("Mã OTP đã hết hạn!")
      err.statusCode = 400;
      throw err
    } 
    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(otp, rightOtpFind.otp);
    if (rightOtpFind.email === email && validUser) {
      const user = User.findOne({email});
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "3 days",
      });
      await user.updateOne({
        $set:{
          isAuthOTP : true
        }
      });
      const OTPDelete = await OTPModel.deleteMany({
          email: rightOtpFind.email
      });
      return res.status(200).send({
          message: "User Registration Successfull!",
          token: token,
          
      });
  } else {
    let err = new Error("Mã OTP không chính xác")
    err.statusCode = 400;
    throw err
  }
  } catch (error) {
    
     next(error);
  }
});
router.put("/reset-password", async (req, res, next) => {
  const { resetLink, newPass } = req.body;
  // #swagger.description = 'Endpoint reset password.'
  //#swagger.responses[422] ={description: 'Validation failed.' }
  //#swagger.responses[401] ={description: 'Unauthorized' }
  //#swagger.responses[400] ={description: 'Bad Request' }
  try {
    if (!resetLink) {
      const err = new Error("Không tồn tại token");
      err.statusCode = 417;
      throw err;
    }

    const decode = jwt.verify(resetLink, process.env.JWT_SECRET);

    const user = await User.findOne({ resetLink });
    if (!user) {
      const err = new Error("Người dùng với token không tồn tại");
      err.statusCode = 417;
      throw err;
    }
    user.password = newPass;
    await user.save();

    res.status(200).json("Cập nhật mật khẩu thành công");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const err = new Error("Token hết hạn hoặc không chính xác");
      err.statusCode = 417;
      next(err);
    } else next(error);
  }
});
router.put("/forgot-password", async (req, res, next) => {
  // #swagger.description = 'Endpoint forgot password and then receive a random password in email .'

  
  /* #swagger.parameters['reset-password'] = { 
            in: 'body', 
            '@schema': { 
                "required": [ "email"], 
                "properties": { 
                    
                     "email": { 
                        "type": "string", 
                        "maxLength": 250, 
                        "example": "thang@gmail.com" 
                    } 
                     
                } 
            } 
        } */
  //#swagger.responses[401] ={description: 'Unauthorized' }
  //#swagger.responses[400] ={description: 'Bad Request' }
  try {
    const { email } = req.body;
    console.log(email, req.body);
    const user = await User.findOne({ email });
    let arr = [];
    if (!user) {
      const err = new Error("Dữ liệu nhập vào không hợp lệ");
      let param = {
        msg: "Email đã được đăng ký, vui lòng chọn email khác",
        param: "email",
      };
      err.data = [...arr, param];
      err.statusCode = 422;
      throw err;
    }
    const OTP = otpGenerator.generate(6, {
      digits: true,
     
      specialChars : false,
    });
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "20m",
    // });
    const data = {
      from: "thang00lata@gmail.com",
      to: req.body.email,
      subject: "Đổi mật khẩu!!",
      html: `<h2>Mật khẩu mới của bạn là: ${OTP}</h2>`,
      // html: `<h2>Vui lòng click link ở dưới để đổi mật khẩu!</h2>
      // <p><a href=''>${process.env.CLIENT_URL}/reset-password/${token}</a></p>`,
    };
    sgMail
      .send(data)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        try {
          console.log(error);
          const err = new Error(error.message);
          err.statusCode = 400;
          throw err;
        } catch (error) {
          next(error);
        }
      });
      hashPass = await bcrypt.hash(OTP, 8);
    await user.updateOne({ password: hashPass });
    

    res.json({ message: "Mật khẩu mới đã gửi tới email của bạn" });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
