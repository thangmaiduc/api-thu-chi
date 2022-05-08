var express = require('express');
var User = require('../model/user');
const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");
var { validationResult } = require("express-validator");
const { validate } = require("../middlewave/validation");

var router = express.Router();

/* GET users listing. */

router.patch('/me', async (req, res)=>{
 
    
  const updates = Object.keys(req.body);
  const allowsUpdate =['name'] ;

  const isValidUpdate = updates.every((update)=>allowsUpdate.includes(update))

  if(!isValidUpdate) res.status(400).send({error: 'Chỉnh sửa không hợp lệ'})
  
  try {
      updates.forEach((update)=>req.user[update]=req.body[update])
      await req.user.save();
      res.send(req.user);
  } catch (error) {
      res.status(400).send(error)
  }
})
router.patch('/change-password', validate.validateChangePassword(), async (req, res, next)=>{
 
    // #swagger.description = 'Endpoint change password  .'

  
  /* #swagger.parameters['change-password'] = { 
            in: 'body', 
            '@schema': { 
                "required": [ "password", "oldPassword"], 
                "properties": { 
                    
                     "password": { 
                        "type": "string", 
                        "maxLength": 250, 
                        "minLength": 6, 
                        "example": "123456" 
                    } ,
                    "oldPassword": { 
                        "type": "string", 
                        "maxLength": 250, 
                        "minLength": 6, 
                        "example": "123456" 
                    } 
                     
                } 
            } 
        } */
  //#swagger.responses[401] ={description: 'Unauthorized' }
  //#swagger.responses[400] ={description: 'Bad Request' }
  
  const updates = Object.keys(req.body);
  const allowsUpdate =['password', 'oldPassword'] ;

  const isValidUpdate = updates.every((update)=>allowsUpdate.includes(update))

  if(!isValidUpdate && !req.body.oldPassword) res.status(400).send({error: 'Chỉnh sửa không hợp lệ'})
  console.log(req.body);
  try {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error("Dữ liệu nhập vào không hợp lệ");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
      }
   let isMatch =await req.user.isMatch(req.body.oldPassword)
   console.log(isMatch);
     if(isMatch ===false)
      {let arr=[]
        let err = new Error('Dữ liệu nhập vào không hợp lệ')
        let param = {
          msg: "Mật khẩu cũ không chính xác",
          param: "oldPassword",
        };
        err.data = [...arr, param];
        err.statusCode = 422;
        throw err;
      }
      req.user['password']=req.body['password']
      await req.user.save();
      res.json('Đổi mật khẩu thành công');

  } catch (error) {
      next(error)
  }
})
router.post('/upload', upload.single('image'),async (req, res, next)=>{
  try {
     // #swagger.description = 'Endpoint change image avatar  .'

  
  /* #swagger.parameters['change-image'] = { 
            in: 'body', 
            '@schema': { 
                "required": [ "image"], 
                "properties": { 
                    
                     
                    "image": { 
                        "type": "file", 
                        "extensions":".png|.jpeg.|jpg",
                        "example": "123456" 
                    } 
                     
                } 
            } 
        } */
  //#swagger.responses[401] ={description: 'Unauthorized' }
  //#swagger.responses[400] ={description: 'Bad Request' }
   
    if(req.user.cloudinary_id){
      await cloudinary.uploader.destroy(req.user.cloudinary_id);
    }
    // Create new user
    const result = await cloudinary.uploader.upload(req.file.path);
      req.user.avatar= result.secure_url,
      req.user.cloudinary_id=result.public_id,
    
    // Save user
    await req.user.save();
    res.status(200).json(req.user);
  } catch (err) {
    
    next(err);
  }
})
router.get('/me', async (req, res)=>{
  
  try {
    let {_id, email, name} = req.user
      res.status(200).json({_id, email, name})
  } catch (error) {
      res.status(400).send(error)
  }
})

module.exports = router;
