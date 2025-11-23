const mongoose = require('mongoose');

const connectDatabase = async ({ uri }) => {
  const connectionUri = uri || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/coderhouse';
  await mongoose.connect(connectionUri);
  return mongoose.connection;
};

module.exports = connectDatabase;
