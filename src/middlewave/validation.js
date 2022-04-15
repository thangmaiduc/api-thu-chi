const {check} = require('express-validator');

let validateRegisterUser = () => {
  return [ 
    check('email', 'Email không chính xác').not().isEmpty(),
    check('name', 'Tên không chính xác').not().isEmpty(),
    check('email',  'Email tối thiểu phải 7 kí tự').isLength({ min: 7 }),
    check('name',  'Tên tối thiểu phải 5 kí tự').isLength({ min: 5 }),
    check('email', 'Email không chính xác').isEmail(),
    check('password', 'Mật khẩu tối thiểu phải 6 kí tự').isLength({ min: 6 })
  ]; 
}

let validateLogin = () => {
  return [ 
    check('email', 'Email không chính xác').not().isEmpty(),
    check('email', 'Email không chính xác').isEmail()
  ]; 
}
let validatePostGroup=() =>{
    return [
        check('name', 'Tên nhóm không chính xác' ).not().isEmpty(),
        check('color', 'Màu không chính xác' ).not().isEmpty(),
        check('type', 'Nhóm không chính xác' ).not().isEmpty(),
        check('type', 'Nhóm không hợp lệ' ).isIn['thu', 'chi']
    ]
}
let validatePostBoth=() =>{
    return [
        check('money', 'Tiền không hợp lệ' ).not().isEmpty(),
        check('money', 'Tiên không hợp lệ' ).isCurrency(),
        check('group', 'Nhóm không hợp lệ' ).not().isEmpty(),
        check('type', 'Kiểu không hợp lệ' ).not().isEmpty(),
        check('type', 'Kiểu không hợp lệ' ).isIn(['thu','chi']),
    ]
}
let validate = {
    validateRegisterUser,
    validateLogin,
    validatePostGroup,
    validatePostBoth
  };
  
  module.exports = {validate};