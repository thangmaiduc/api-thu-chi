var express = require('express');
var jwt = require("jsonwebtoken");
var User = require('../model/user');

var router = express.Router();

/* GET users listing. */
router.post('/login', async function(req, res, next) {
    const { email, password } = req.body
    try {
      const user = await User.findByCredentials(email, password)
      if (!user) {
        res
          .status(404)
          .json({ error: { message: 'Email hoặc mật khẩu không hợp lệ' } })
      }
      const token = jwt.sign({ userId : user._id},process.env.JWT_SECRET,{expiresIn:'3 days'});

      res.setHeader('authToken', token)
      res.status(200).json({ user, token })
    } catch (error) {
      console.log(error)
      return res.status(500).send(error)
    }

});

  

router.post('/create',async (req, res)=>{
    
    try {
        const user  = new  User(req.body) ;
        await user.save()
        const token = jwt.sign({ userId : user._id},process.env.JWT_SECRET,{expiresIn:'3 days'});

      res.setHeader('authToken', token)
      res.status(200).json({ user, token })
        
    } catch (_error) {
        
        res.status(500).send(_error);
    }
})
module.exports = router;