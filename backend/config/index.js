require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/automation_dashboard',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  env: process.env.NODE_ENV || 'development'
};
