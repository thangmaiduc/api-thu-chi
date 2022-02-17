const CreditClass = require('../model/credit-class');

function canViewCreditClass(user, creditClass) {
    return (
      user.role === 'admin' ||
      creditClass.TeacherUserId === user.id
    )
  }
 function authGetCreditClass(req, res, next) {
    if (!canViewCreditClass(req.user, req.creditClass)) {
      res.status(401)
      return res.send('Not Allowed')
    }
  
    next()
  }
 
module.exports = {
    authGetCreditClass
}