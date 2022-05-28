var express = require("express");
var usersRouter = require("./user");
var { authUser } = require("../middlewave/auth");
var router = express.Router();
var receiptsRouter = require("./receipts");
var expenditureRouter = require("./expenditure");
var postRouter = require("./post");
var groupRouter = require("./group");

/* GET home page. */

router.use(authUser);
router.use(
  "/khoan-thu/",
  receiptsRouter
  //#swagger.ignore = true
);
router.use(
  "/nhom/",
  groupRouter
  // #swagger.tags = ['Group']
  /* #swagger.security = [{
        "Bearer": []
    }] */
);
router.use(
  "/khoan-chi/",
  expenditureRouter
  // #swagger.ignore = true
);
router.use(
  "/khoan-thu-chi/",
  postRouter
  // #swagger.tags = ['Post']
  // #swagger.description = 'Endpoint for expenditure and receipts.'
  /* #swagger.security = [{
        "Bearer": []
    }] */
);
router.use(
  "/users",
  usersRouter
  // #swagger.tags = ['User']
  /* #swagger.security = [{
        "Bearer": []
    }] */
);
router.get("/", async (req, res) => {
  //#swagger.ignore = true
  try {
    var c = new Receipts({
      money: 245000,
      note: "tien an vat thang 2",
      group: "620df8630f474f81b4fae558",
      owner: "6209b5cdca0a9451ce1238c5",
      date: new Date(Date.UTC(2022, 2, 19)),
    });
    await c.save();
    res.json(c);
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ status: "err" });
  }
});

module.exports = router;
