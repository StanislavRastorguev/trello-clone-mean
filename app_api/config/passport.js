const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

const User = mongoose.model('User');

// local strategy for authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    (username, password, done) => {
      User.findOne(
        {
          email: username,
        },
        (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: 'Incorrect username.',
            });
          }
          // check password
          user
            .verifyPassword(password, user.hash)
            .then(data => {
              if (!data) {
                return done(null, false, {
                  message: 'Incorrect password.',
                });
              }
              return done(null, user);
            })
            .catch(() => done(null, false));
          return done(null, false);
        }
      );
    }
  )
);

// facebook strategy for authentication
passport.use(
  new FacebookStrategy(
    {
      clientID: keys.facebook.clientID,
      clientSecret: keys.facebook.clientSecret,
      callbackURL: keys.facebook.callbackURL,
      profileFields: keys.facebook.profileFields,
    },
    // eslint-disable-next-line consistent-return
    (accessToken, refreshToken, profile, done) => {
      const { displayName, id } = profile;
      const email = profile.emails[0].value;
      if (!email) {
        return done({ message: 'Failed to receive e-mail' });
      }

      // find a user in the database or register a new one
      User.findOne(
        {
          email,
        },
        (err, user) => {
          if (user) {
            return done(null, user);
          }
          const newUser = new User();
          newUser.name = displayName;
          newUser.email = email;
          // temporary password
          newUser
            .setPassword(id)
            .then(hash => {
              newUser.hash = hash;
              newUser.save(error => {
                if (error) {
                  return done(error);
                }
                return done(null, newUser);
              });
            })
            .catch(error => {
              return done(error);
            });
          return undefined;
        }
      );
    }
  )
);

// google strategy for authentication
passport.use(
  new GoogleStrategy(
    {
      callbackURL: keys.google.callbackURL,
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      const { displayName, id } = profile;
      const email = profile.emails[0].value;
      if (!email) {
        return done({ message: 'Failed to receive e-mail' });
      }

      // find a user in the database or register a new one
      User.findOne(
        {
          email,
        },
        (err, user) => {
          if (user) {
            done(null, user);
          } else {
            const newUser = new User();
            newUser.name = displayName;
            newUser.email = email;
            // temporary password
            newUser
              .setPassword(id)
              .then(hash => {
                newUser.hash = hash;
                newUser.save(error => {
                  if (error) {
                    return done(error);
                  }
                  return done(null, newUser);
                });
              })
              .catch(error => done(error));
          }
        }
      );
      return undefined;
    }
  )
);
