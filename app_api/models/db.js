const mongoose = require('mongoose');

let dbURI = 'mongodb://localhost/trello_clone';

if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI, { poolSize: 15 });

const db = mongoose.connection;

db.on('error', err => {
  // eslint-disable-next-line no-console
  console.log(`Mongoose connection error: ${err}`);
});
db.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log(`Mongoose connected to ${dbURI}`);
  // eslint-disable-next-line no-console
  console.log(`Ready state ${db.readyState}`);
});
db.on('disconnected', () => {
  // eslint-disable-next-line no-console
  console.log('Mongoose disconnected');
});

require('./board');
require('./users');
