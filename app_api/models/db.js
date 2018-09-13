const mongoose = require('mongoose');
let dbURI = 'mongodb://localhost/trello_clone';

if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI, {poolSize: 15});

const db = mongoose.connection;

db.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
});
db.on('connected', () => {
  console.log('Mongoose connected to ' + dbURI);
  console.log('Ready state ' + db.readyState)
});
db.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

require('./board');
require('./users');