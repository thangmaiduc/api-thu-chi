var express = require('express');

const {getMonth,updatePost,getPost, deletePost, createPost, getPostByMonth, getPostAMonthGroupDate} = require('../controller/post')
var router = express.Router();
const {validate} =  require('../middlewave/validation')
/* GET users listing. */

router.get('/thang/:date',getMonth )
router.get('/thang/:date/so-do',getPostByMonth )
router.get('/thang/:date/ngay',getPostAMonthGroupDate )
router.get('/:id',getPost )
router.post('/', validate.validatePostBoth(),createPost )
router.patch('/:id',updatePost )
router.delete('/:id',deletePost )

module.exports = router;