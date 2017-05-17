/* eslint-disable no-console, no-constant-condition */
import mongoose from 'mongoose';
import createProductModel from './models/product';
import createUserModel from './models/user';

mongoose.Promise = Promise;
const dotenv = require('dotenv').config({ silent: true }); //eslint-disable-line
const MONGO_DB = process.env.AWS_MONGO_URI_DEV;
const options = {
  server: {
    socketOptions: {
      keepAlive: 30000,
      connectTimeoutMS: 30000,
    },
  },
};
export const closeDB = db => new Promise((resolve) => {
  resolve(
    db.close(() => {
      console.log('\nmongo/connection.js @ CLOSE DB');
      console.log('\nconnections: ', JSON.stringify(db.connections, null, 2));
    }),
  );
});

export const startDB = () => {
  console.log('\nMONGO_DB: ', MONGO_DB);
  const newDB = mongoose.createConnection(MONGO_DB, options, (error) => {
    if (error) {
      console.log(`\nCould not connect to Mongo DB.\n
      ERROR: ${error}`);
    } else {
      console.log(`\nMongo Connected @ ${MONGO_DB}`);
    }
  });
  return ({
    Product: createProductModel(newDB),
    User: createUserModel(newDB),
    db: newDB,
  });
};