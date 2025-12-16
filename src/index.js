/**
 * Application Entry Point
 * Telegram + WhatsApp Bot
 */

require('dotenv').config();

/* ===== Validation ===== */
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is missing');
  process.exit(1);
}

/* ===== Imports ===== */
const startTelegramBot = require('./bots/telegram/bot');

/* ===== Bootstrap ===== */
async function bootstrap() {
  try {
    console.log('🚀 Starting application...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Start Telegram Bot
    startTelegramBot(process.env.TELEGRAM_BOT_TOKEN);

    console.log('✅ Application started successfully');
  } catch (error) {
    console.error('❌ Application failed to start');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
