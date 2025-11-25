require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDatabase } = require('./config/database');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDatabase();
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
