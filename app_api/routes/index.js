const express = require('express');

const router = express.Router();
const jwt = require('express-jwt');
const passport = require('passport');
const ctrlBoard = require('../controllers/board');
const ctrlLists = require('../controllers/lists');
const ctrlTasks = require('../controllers/tasks');
const ctrlAttachments = require('../controllers/attachments');
const fileUploader = require('../controllers/fileUploader');
const ctrlAuth = require('../controllers/authentication');

const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload',
});

// routes for board
router.get('/board', ctrlBoard.readBoard);
router.put('/board/:boardid/lists', auth, ctrlBoard.updateBoard);

// routes for lists on the board
router.post('/board/:boardid/list', auth, ctrlLists.createList);
router
  .route('/board/:boardid/list/:listid')
  .put(auth, ctrlLists.updateList)
  .delete(auth, ctrlLists.deleteList);

// routes for tasks in lists
router.post('/board/:boardid/list/:listid/task', auth, ctrlTasks.createTask);
router
  .route('/board/:boardid/list/:listid/task/:taskid')
  .put(auth, ctrlTasks.updateTask)
  .delete(auth, ctrlTasks.deleteTask);

// routes for attachments in tasks
router.post(
  '/board/:boardid/list/:listid/task/:taskid/attachments',
  auth,
  (req, res) => {
    fileUploader.upload(req, res, err => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.json({ success: false, message: 'LIMIT_FILE_SIZE' });
        } else if (err.message === 'FILE_TYPE') {
          res.json({ success: false, message: 'FILE_TYPE' });
        } else {
          res.json({ success: false, message: 'FILE_WAS_NOT_UPLOADED' });
        }
      } else {
        ctrlAttachments.createAttachment(req, res);
      }
    });
  }
);
router.delete(
  '/board/:boardid/list/:listid/task/:taskid/attachments/:attachmentid',
  auth,
  ctrlAttachments.deleteAttachment
);

// route for user info
router.get('/userinfo/:token', auth, ctrlAuth.userInfo);

// routes for local register or login
router.post('/register', ctrlAuth.registerUser);
router.post('/login', ctrlAuth.login);

// routes for authenticate with social networks
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope: ['public_profile', 'email'],
  })
);
router.get(
  '/auth/facebook/redirect',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/login',
  }),
  ctrlAuth.socialNetworksLogin
);

router.get(
  '/auth/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email', 'openid'],
  })
);
router.get(
  '/auth/google/redirect',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  ctrlAuth.socialNetworksLogin
);

module.exports = router;
