var express = require('express');

const {getMonth,updatePost,getPost, deletePost, createPost} = require('../controller/post')
var router = express.Router();
const {validate} =  require('../middlewave/validation')
/* GET users listing. */

router.get('/thang/:date',getMonth )
router.get('/:id',getPost )
router.post('/', validate.validatePostBoth(),createPost )
router.patch('/:id',updatePost )
router.delete('/:id',deletePost )

module.exports = router;