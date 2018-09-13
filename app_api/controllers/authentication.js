const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

//json response and status code to client side
let sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

//function for register user
module.exports.registerUser = (req, res) => {
  const { name, email, password } = req.body;
  if(!name || !email || !password) {
    sendJsonResponse(res, 400, {
      "message": "All fields are required"
    });
    return;
  }

  //find user by email
  User.findOne({ email: email }, (err, user) => {

    if (user) {
      sendJsonResponse(res, 404, {
        "message": "Email already used"
      });
    } else {

      //register user if it is not already exists
      let user = new User();
      user.name = name;
      user.email = email;

      user.setPassword(password)
        .then((hash) => {
          user.hash = hash;
          user.save((err) => {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {

              //return json web token for authorization
              let token = user.generateJwt(user);
              sendJsonResponse(res, 200, {
                "token": token,
                "name": user.name
              });
            }
          });
        })
        .catch((err) => {
          sendJsonResponse(res, 404, err);
        })
    }
  });
};

//function for user authentication
module.exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendJsonResponse(res, 400, {
      "message": "all fields are required"
    });
    return;
  }

  //use passport local strategy for authentication user
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      sendJsonResponse(res, 404, err);
      return;
    }

    if (user) {
      //return json web token for authorization
      let token = user.generateJwt(user);
      sendJsonResponse(res, 200, {
        "token": token,
        "name": user.name
      });
    } else {
      sendJsonResponse(res, 401, info);
    }
  })(req, res);
};

//function for authentication user with social networks (google, facebook)
module.exports.socialNetworksLogin = (req, res) => {
  let user = req.user;
  if (user) {
    //return json web token and user name in url for authorization
    let token = user.generateJwt(user);
    res.redirect(`/?token=${token}&name=${user.name}`);
  }
};

//function for get user information if it doesn't exist in local storage
module.exports.userInfo = (req, res) => {
  let user = new User();
  let token = user.verifyJwt(req.params.token);

  User.findById(token.token._id)
    .exec((err, user) => {
      sendJsonResponse(res, 200, user.name);
    });
};