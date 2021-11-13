const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb+srv://rsynenko:yy87JCLX00kQHWyA@cluster0-5h0mx.mongodb.net/node-complete?retryWrites=true&w=majority'
  )
    .then(client => {
      console.log('MongoDB connected!');

      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);

      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw new Error('No database found!');
};

module.exports = { mongoConnect, getDb };
