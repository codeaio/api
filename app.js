var createError = require("http-errors");
var bodyParser = require("body-parser");
var express = require("express");
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
var path = require("path");
var cookieParser = require("cookie-parser");
const session = require('express-session');
const passport = require('passport');
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");
var app = express();

app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//passport config
require('./config/passport')(passport);
// DB config
const db = require('./config/keys').MongoURI;

//EJS
app.use(expressLayouts);
app.set("views", path.join(__dirname, "views"));
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//connect to MongoURI
mongoose.connect(db,{useNewUrlParser: true})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

//Express  Sessions
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

//Connect Flashes
app.use(flash());

app.use((req,res,next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
})

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var taskRouter = require("./routes/task");

// view engine setup


app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/task", taskRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
