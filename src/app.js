var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./db/mongoose');

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger_output.json')
var cors = require('cors')

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// dat xac thực auth trước các route khác và sau login
app.use(cors())
app.use('/auth',loginRouter
// #swagger.tags = ['Auth']
// #swagger.description = 'Endpoint for login, logout, forget password.'
    /* #swagger.security = [{
        "apiKeyAuth": []
    }] */

    /* #swagger.responses[500] = {
            description: "Error Internal Server"
    } */
    /* #swagger.responses[404] = {
            description: "Not found "
    } */

);

app.use('/api', indexRouter
// #swagger.tags = ['Api']
    
    );
 app.get('/', (req, res)=>{
   res.status(200).json({status:"ok"});
 })
 
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message;
  
  if(status === 422){
    let errors={} ;
    error.data.forEach( err =>{
      
      let key = err.param;
      let value = err.msg;
      
      errors[key] = value;
    })
    res.status(status).json({ message: message, errors  });
    return
  }
  res.status(status).json({ message: message });
});



module.exports = app;
