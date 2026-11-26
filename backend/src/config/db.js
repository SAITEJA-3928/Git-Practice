const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry support for containerized/VM startup ordering.
 * @param {string} uri
 * @param {number} retries
 * @param {number} delayMs
 */
async function connectDB(uri, retries = 8, delayMs = 3000) {
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`[DB] Connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = { connectDB };
