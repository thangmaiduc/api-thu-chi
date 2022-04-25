var express = require('express');
var User = require('../model/user');
const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");

var router = express.Router();

/* GET users listing. */

router.patch('/me', upload.single("image") ,async (req, res)=>{
 
    
  const updates = Object.keys(req.body);
  const allowsUpdate =['name','password', 'image'] ;

  const isValidUpdate = updates.every((update)=>allowsUpdate.includes(update))

  if(!isValidUpdate) res.status(400).send({error: 'Chỉnh sửa không hợp lệ'})
  
  try {
    
    // Upload image to cloudinary
    let result;
    if (req.file) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
      result = await cloudinary.uploader.upload(req.file.path);
    }
    delete req.body.image;
    
    req.user.avatar= result?.secure_url || req.user.avatar,
    req.user.cloudinary_id= result?.public_id || req.user.cloudinary_id,
    
    
      updates.forEach((update)=>req.user[update]=req.body[update])
      await req.user.save();
      res.send(req.user);
  } catch (error) {
      res.status(400).send(error)
  }
})
router.get('/me', async (req, res)=>{
  
  try {
    let {_id, email, name, avatar} = req.user
      res.status(200).json({_id, email, name, avatar})
  } catch (error) {
      res.status(400).send(error)
  }
})

module.exports = router;
