/**
 * Application Entry Point
 * Stage 1 + Stage 2 + Stage 3
 */

require('dotenv').config();

const { startServer } = require('./web/server');
const { connectDatabase } = require('./config/database');
const db = require('./models');
const { startTelegramBot } = require('./bots/telegram/bot');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    console.log('🚀 Starting application...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Database
    await connectDatabase();
    await db.sequelize.sync();
    console.log('📦 Database synced');

    // Server
    await startServer(PORT);

    // Telegram Bot
    startTelegramBot();

    console.log('✅ Application started successfully');
  } catch (error) {
    console.error('❌ Application failed to start');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
