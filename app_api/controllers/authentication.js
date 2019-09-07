const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('User');

// json response and status code to client side
const sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

// function for register user
module.exports.registerUser = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    sendJsonResponse(res, 400, {
      message: 'All fields are required',
    });
    return;
  }

  // find user by email
  User.findOne({ email }, (err, userExists) => {
    if (userExists) {
      sendJsonResponse(res, 404, {
        message: 'Email already used',
      });
    } else {
      // register user if it is not already exists
      const user = new User();
      user.name = name;
      user.email = email;

      user
        .setPassword(password)
        .then(hash => {
          user.hash = hash;
          user.save(error => {
            if (error) {
              sendJsonResponse(res, 404, error);
            } else {
              // return json web token for authorization
              const token = user.generateJwt(user);
              sendJsonResponse(res, 200, {
                token,
                name: user.name,
              });
            }
          });
        })
        .catch(error => {
          sendJsonResponse(res, 404, error);
        });
    }
  });
};

// function for user authentication
module.exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendJsonResponse(res, 400, {
      message: 'all fields are required',
    });
    return;
  }

  // use passport local strategy for authentication user
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      sendJsonResponse(res, 404, err);
      return;
    }

    if (user) {
      // return json web token for authorization
      const token = user.generateJwt(user);
      sendJsonResponse(res, 200, {
        token,
        name: user.name,
      });
    } else {
      sendJsonResponse(res, 401, info);
    }
  })(req, res);
};

// function for authentication user with social networks (google, facebook)
module.exports.socialNetworksLogin = (req, res) => {
  const { user } = req;
  if (user) {
    // return json web token and user name in url for authorization
    const token = user.generateJwt(user);
    res.redirect(`/?token=${token}&name=${user.name}`);
  }
};

// function for get user information if it doesn't exist in local storage
module.exports.userInfo = (req, res) => {
  const user = new User();
  const token = user.verifyJwt(req.params.token);

  User.findById(token.token._id).exec((err, userInfo) => {
    sendJsonResponse(res, 200, userInfo.name);
  });
};
