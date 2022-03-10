const express = require('express');
const jwt = require("jsonwebtoken");
const User = require('../model/user');
const {validate} = require('../middlewave/validation')
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
        const user  = new  User(req.body) ;
        await user.save()
        const token = jwt.sign({ userId : user._id},process.env.JWT_SECRET,{expiresIn:'3 days'});

      res.setHeader('authToken', token)
      res.status(201).json({ user, token })
        
    } catch (error) {
        
        next(error)
    }
})
module.exports = router;