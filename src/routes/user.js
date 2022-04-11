var express = require('express');
var User = require('../model/user');

var router = express.Router();

/* GET users listing. */

router.patch('/me', async (req, res)=>{
 
    
  const updates = Object.keys(req.body);
  const allowsUpdate =['name','password'] ;

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
router.get('/me', async (req, res)=>{
  
  try {
    let {_id, email, name} = req.user
      res.status(200).json({_id, email, name})
  } catch (error) {
      res.status(400).send(error)
  }
})

module.exports = router;
