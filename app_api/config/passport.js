const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  keys = require('./keys'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

//local strategy for authentication
passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  (username, password, done) => {

    User.findOne({
      email: username
    }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }
      //check password
      user.verifyPassword(password, user.hash)
        .then((data) => {
          if (!data) {
            return done(null, false, {
              message: 'Incorrect password.'
            });
          } else {
            return done(null, user);
          }
        })
        .catch(() => {
          return done(null, false);
        })
    });
  }
));

//facebook strategy for authentication
passport.use(new FacebookStrategy({
    clientID: keys.facebook.clientID,
    clientSecret: keys.facebook.clientSecret,
    callbackURL: keys.facebook.callbackURL,
    profileFields: keys.facebook.profileFields
  },
  (accessToken, refreshToken, profile, done) => {
    const { displayName, id } = profile;
    const email = profile.emails[0].value;
    if (!email) {
      return done({ message: 'Failed to receive e-mail' })
    }

    //find a user in the database or register a new one
    User.findOne({
      email: email
    }, (err, user) => {
      if (user) {
        return done(null, user);
      } else {
        let newUser = new User();
        newUser.name = displayName;
        newUser.email = email;
        //temporary password
        newUser.setPassword(id)
          .then((hash) => {
            newUser.hash = hash;
            newUser.save((err) => {
              if (err) {
                return done(err);
              } else {
                return done(null, newUser);
              }
            });
          })
          .catch((err) => {
            return done(err);
          })
      }
    })
  }
));

//google strategy for authentication
passport.use(new GoogleStrategy({
  callbackURL: keys.google.callbackURL,
  clientID: keys.google.clientID,
  clientSecret: keys.google.clientSecret
  },
  (accessToken, refreshToken, profile, done) => {
    const { displayName, id } = profile;
    const email = profile.emails[0].value;
    if (!email) {
      return done({ message: 'Failed to receive e-mail' })
    }

    //find a user in the database or register a new one
    User.findOne({
      email: email
    }, (err, user) => {
      if (user) {
        done(null, user);
      } else {
        let newUser = new User();
        newUser.name = displayName;
        newUser.email = email;
        //temporary password
        newUser.setPassword(id)
          .then((hash) => {
            newUser.hash = hash;
            newUser.save((err) => {
              if (err) {
                return done(err);
              } else {
                return done(null, newUser);
              }
            });
          })
          .catch((err) => {
            return done(err);
          })
      }
    });
  }
));