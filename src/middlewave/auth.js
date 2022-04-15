const jwt = require("jsonwebtoken");
const User = require("../model/user");

const authUser = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization") &&
      req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      const error = new Error("Bạn chưa đăng nhập, vui lòng đăng nhập");
      error.statusCode = 401;
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decode.userId });
    if (!user) {
        const error = new Error("Tài khoản không tồn tài");
        error.statusCode = 401;
    }
    req.user = user;

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "token không hợp lệ hoặc, đã quá hạn vui lòng đăng nhập lại";
    }
    next(error);
  }
};
function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(401).send("not allowed");
    }
    next();
  };
}

module.exports = {
  authUser,
  authRole,
};
