require('dotenv').load();
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const uglifyJs = require('uglify-es');
const fs = require('fs');
const passport = require('passport');

require('./app_api/models/db');
require('./app_api/config/passport');

const routesAPI = require('./app_api/routes/index');

const app = express();

// read files from client side, minify and write in trello-clone.min.js
const appClientFiles = {
  'app.js': fs.readFileSync('app_client/app.js', 'utf8'),
  'home.controller.js': fs.readFileSync(
    'app_client/home/home.controller.js',
    'utf8'
  ),
  'register.controller.js': fs.readFileSync(
    'app_client/auth/register/register.controller.js',
    'utf8'
  ),
  'login.controller.js': fs.readFileSync(
    'app_client/auth/login/login.controller.js',
    'utf8'
  ),
  'pageHeader.controller.js': fs.readFileSync(
    'app_client/common/directives/pageHeader/pageHeader.controller.js',
    'utf8'
  ),
  'loginModal.controller.js': fs.readFileSync(
    'app_client/common/directives/loginModal/loginModal.controller.js',
    'utf8'
  ),
  'boardData.service.js': fs.readFileSync(
    'app_client/common/services/boardData.service.js',
    'utf8'
  ),
  'listData.service.js': fs.readFileSync(
    'app_client/common/services/listData.service.js',
    'utf8'
  ),
  'taskData.service.js': fs.readFileSync(
    'app_client/common/services/taskData.service.js',
    'utf8'
  ),
  'attachmentData.service.js': fs.readFileSync(
    'app_client/common/services/attachmentData.service.js',
    'utf8'
  ),
  'authentication.service.js': fs.readFileSync(
    'app_client/common/services/authentication.service.js',
    'utf8'
  ),
  'pageHeader.directive.js': fs.readFileSync(
    'app_client/common/directives/pageHeader/pageHeader.directive.js',
    'utf8'
  ),
  'quickTaskEditModal.directive.js': fs.readFileSync(
    'app_client/common/directives/quickTaskEditModal/quickTaskEditModal.directive.js',
    'utf8'
  ),
  'taskEditModal.directive.js': fs.readFileSync(
    'app_client/common/directives/taskEditModal/taskEditModal.directive.js',
    'utf8'
  ),
  'changeTaskPosition.directive.js': fs.readFileSync(
    'app_client/common/directives/changeTaskPosition/changeTaskPosition.directive.js',
    'utf8'
  ),
  'dateTimePicker.directive.js': fs.readFileSync(
    'app_client/common/directives/dateTimePicker/dateTimePicker.directive.js',
    'utf8'
  ),
  'inputTimeFormat.directive.js': fs.readFileSync(
    'app_client/common/directives/inputTimeFormat/inputTimeFormat.directive.js',
    'utf8'
  ),
  'loginModal.directive.js': fs.readFileSync(
    'app_client/common/directives/loginModal/loginModal.directive.js',
    'utf8'
  ),
  'message.factory.js': fs.readFileSync(
    'app_client/common/factories/message.factory.js',
    'utf8'
  ),
  'socketio.factory.js': fs.readFileSync(
    'app_client/common/factories/socketio.factory.js',
    'utf8'
  ),
};

const uglified = uglifyJs.minify(appClientFiles, { compress: false });

fs.writeFile(
  'app_client/lib/angular/trello-clone.min.js',
  uglified.code,
  err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } else {
      // eslint-disable-next-line no-console
      console.log('Script generated and saved:', 'trello-clone.min.js');
    }
  }
);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app_client')));

app.use(passport.initialize());

app.use('/api', routesAPI);

// send index.html with angular.js
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});

// catch 401 unauthorized requests
app.use((err, req, res) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({ message: `${err.name}: ${err.message}` });
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
