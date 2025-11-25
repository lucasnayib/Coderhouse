const mongoose = require('mongoose');

const defaultUri = 'mongodb://localhost:27017/coderhouse';

const connectDatabase = async (uri = process.env.MONGODB_URI || defaultUri) => {
  if (!uri) {
    throw new Error('MongoDB connection string is not defined');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = { connectDatabase };
