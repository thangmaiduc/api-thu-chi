var express = require("express");

var {
  getDay,
  getMonthCur,
  getMonthNext,
  getYearCur,
  getYearNext,
} = require("../util/handleDate");

var Receipts = require("../model/receipts");

var router = express.Router();

router.post("/", async (req, res, next) => {
  try {
   
    var khoanthu = new Receipts({ ...req.body, owner: req.user._id });

    await khoanthu.save();
    res.status(201).json(khoanthu);
  } catch (error) {
    next(error)
  }
});


router.patch("/:id", async (req, res, next) => {
  var _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowsUpdate = ["money", "note", "group", "date"];

  const isValidUpdate = updates.every((update) =>
  allowsUpdate.includes(update)
  );
  
  if (!isValidUpdate) res.status(400).json({ error: "Thay đổi không hợp lệ" });
  
  try {
    var thu = await Receipts.findOne({ _id, owner: req.user._id });
    if (!thu)  {
      const err= new Error('Không thấy khoảng thu');
      err.statusCode=(404);
      throw err;
    }
    
    

    updates.forEach((update) => (thu[update] = req.body[update]));
    await thu.save();
    res.json(thu);
  } catch (error) {
    next(error)
  }
});
router.delete("/:id", async (req, res, next) => {
  var _id = req.params.id;
  try {
    var thu = await Receipts.findOneAndDelete({ _id, owner: req.user._id });
    if (!thu) {
      const err= new Error('Không thấy khoảng thu');
      err.statusCode=(404);
      throw err;
    }
        res.status(200).send(thu);
  } catch (error) {
    next(error)
  }
});

module.exports = router;

  // router.get("/khoang/:fromdate/:todate/", async (req, res, next) => {
  //   var fromdate = req.params.fromdate;
  //   var todate = req.params.todate;
  
  //   try {
  //     var thu = await Receipts.find({
  //       owner: req.user._id,
  //       date: {
  //         $gte: fromdate,
  //         $lt: todate,
  //       },
  //     });
  //     res.status(200).json(thu);
  //   } catch (error) {
  //     next(error)
  //   }
  // });
  // router.get("/ngay/:date", async (req, res, next) => {
  //   var mydate = req.params.date;
  
  //   try {
  //     var thu = await Receipts.find({
  //       owner: req.user._id,
  //       date: { $gte: mydate, $lt: getDay(mydate) },
  //     });
  //     res.status(200).json(thu);
  //   } catch (error) {
  //     next(error)
  //   }
  // });
  
  // router.get("/thang/:date", async (req, res, next) => {
  //   var mydate = req.params.date;
  //   console.log(getMonthNext(mydate));
  //   console.log(getMonthCur(mydate));
  //   try {
  //     var thu = await Receipts.find({
  //       owner: req.user._id,
  //       date: { $gte: getMonthCur(mydate), $lt: getMonthNext(mydate) },
  //     });
  //     res.status(200).json(thu);
  //   } catch (error) {
  //     next(error)
  //   }
  // });
  
  // router.get("/nam/:date", async (req, res, next) => {
  //   var mydate = req.params.date;
  //   console.log(getYearNext(mydate));
  //   console.log(getYearCur(mydate));
  //   try {
  //     var thu = await Receipts.find({
  //       owner: req.user._id,
  //       date: { $gte: getYearCur(mydate), $lt: getYearNext(mydate) },
  //     });
  //     res.status(200).json(thu);
  //   } catch (error) {
  //     next(error)
  //   }
  // });