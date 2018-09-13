const mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  jwt = require('jsonwebtoken'),
  saltRounds = 10;

let userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hash: String
});

userSchema.methods.setPassword = (password) => {
  return bcrypt.hash(password, saltRounds);
};

userSchema.methods.verifyPassword = (password, hash) => {
  return bcrypt.compare(password, hash)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err);
    })
};

userSchema.methods.generateJwt = (user) => {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: user._id,
    exp: parseInt(expiry.getTime() / 1000)
  }, process.env.JWT_SECRET);
};

userSchema.methods.verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return err;
    } else {
      return {
        token: decoded
      };
    }
  });
};

mongoose.model('User', userSchema);