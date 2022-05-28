var express = require('express');

const {getMonth,updatePost,getPost, deletePost, createPost, getPostByMonth, getPostAMonthDate, exportPdf, getPosts} = require('../controller/post')
var router = express.Router();
const {validate} =  require('../middlewave/validation')
/* GET users listing. */

router.get('/thang/',getMonth )
router.get('/thang/:date/so-do',getPostByMonth )
router.get('/thang/:date/ngay',getPostAMonthDate )
// router.get('/thang/:date/pdf',exportPdf )
router.get('/ngay/pdf/:dateStart/:dateEnd',exportPdf)
router.get('/:id',getPost )
router.get('/',getPosts )
router.post('/', validate.validatePostBoth(),createPost )
router.patch('/:id',updatePost )
router.delete('/:id',deletePost )

module.exports = router;