const {check} = require('express-validator');

let validateRegisterUser = () => {
  return [ 
    check('email', 'Invalid does not Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'password more than 7 degits').isLength({ min: 7 })
  ]; 
}

let validateLogin = () => {
  return [ 
    check('email', 'Invalid does not Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'password more than 7 degits').isLength({ min: 7 })
  ]; 
}
let validatePostGroup=() =>{
    return [
        check('name', 'Invalid does not empty' ).not().isEmpty(),
        check('color', 'Invalid does not empty' ).not().isEmpty()
    ]
}
let validatePostBoth=() =>{
    return [
        check('money', 'Invalid does not empty' ).not().isEmpty(),
        check('money', 'Invalid Currency' ).isCurrency(),
        check('group', 'Invalid does not empty' ).not().isEmpty(),
        check('type', 'Invalid does not empty' ).not().isEmpty()
    ]
}
let validate = {
    validateRegisterUser,
    validateLogin,
    validatePostGroup,
    validatePostBoth
  };
  
  module.exports = {validate};