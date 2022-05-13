var express = require('express');
var router =  express.Router();
var { createGroup,getGroupsByMonth,updateGroup,deleteGroup} = require('../controller/group');

router
    .get('/:mydate', getGroupsByMonth )
    .post('/',createGroup )
    // .get('/:id', getGroup )
    .patch('/:id', updateGroup)
    .delete('/:id', deleteGroup)

module.exports = router;