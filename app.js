var createError = require("http-errors");
var bodyParser = require("body-parser");
var express = require("express");
const flash = require('connect-flash');
var path = require("path");
var cookieParser = require("cookie-parser");
const session = require('express-session');
const passport = require('passport');
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");
const { createProxyMiddleware } = require('http-proxy-middleware');

var app = express();

const options = {
  target: 'http://10.80.123.9:8080',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/api/container': '/',
  },
  router: {
  },
};

const containerProxy = createProxyMiddleware(options);

app.use('/api/container', containerProxy);

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
var projects = require("./routes/projects");
var containers = require("./routes/containers");

app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/task", taskRouter);
app.use("/api/projects", projects);
app.use("/api/containers", containers);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
});

module.exports = app;
