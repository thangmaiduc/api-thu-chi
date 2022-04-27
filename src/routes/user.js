var express = require('express');
var User = require('../model/user');
const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");

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
router.patch('/change-password', async (req, res)=>{
 
    
  const updates = Object.keys(req.body);
  const allowsUpdate =['password', 'oldPassword'] ;

  const isValidUpdate = updates.every((update)=>allowsUpdate.includes(update))

  if(!isValidUpdate && !req.body.oldPassword) res.status(400).send({error: 'Chỉnh sửa không hợp lệ'})
  console.log(req.body);
  try {
     if(!req.user.isMatch(req.body.oldPassword))
      {
        let err = new Error('Mật khẩu không chính xác')
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
      res.status(400).send(error)
  }
})
router.post('/upload', upload.single('image'),async (req, res, next)=>{
  try {
    // Upload image to cloudinary
   
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
