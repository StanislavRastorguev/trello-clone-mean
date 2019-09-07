const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  hash: String,
});

userSchema.methods.setPassword = password => bcrypt.hash(password, saltRounds);

userSchema.methods.verifyPassword = (password, hash) =>
  bcrypt
    .compare(password, hash)
    .then(res => res)
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err);
    });

userSchema.methods.generateJwt = user => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign(
    {
      _id: user._id,
      exp: parseInt(expiry.getTime() / 1000, 10),
    },
    process.env.JWT_SECRET
  );
};

userSchema.methods.verifyJwt = token =>
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return err;
    }
    return {
      token: decoded,
    };
  });

mongoose.model('User', userSchema);
