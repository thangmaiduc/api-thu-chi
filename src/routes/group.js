var express = require('express');
var router =  express.Router();
var { createGroup,getGroups,updateGroup,deleteGroup} = require('../controller/group');

router
    .get('/', getGroups )
    .post('/',createGroup )
    // .get('/:id', getGroup )
    .patch('/:id', updateGroup)
    .delete('/:id', deleteGroup)

module.exports = router;