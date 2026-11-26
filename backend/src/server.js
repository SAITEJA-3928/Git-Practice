require('dotenv').config();
const { connectDB } = require('./config/db');
const { seedDatabaseIfEmpty } = require('./seed/seedData');
const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flipkart_dev';

async function start() {
  await connectDB(MONGO_URI);

  if (process.env.AUTO_SEED !== 'false') {
    await seedDatabaseIfEmpty();
  }

  const app = createApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[API] FlipCart Dev Backend listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((error) => {
  console.error('[Startup Error]', error);
  process.exit(1);
});
