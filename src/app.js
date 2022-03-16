var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./db/mongoose');

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
app.use(loginRouter);

app.use('/api', indexRouter);
 app.get('/', (req, res)=>{
   res.status(200).json({status:"ok"});
 })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((error, req, res, next) => {
  console.log(error.message);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data,  });
});


module.exports = app;
