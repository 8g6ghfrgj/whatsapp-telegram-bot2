/**
 * Application Entry Point
 * Stage 1: Base Express Server
 * No Telegram - No WhatsApp
 */

require('dotenv').config();

const { startServer } = require('./web/server');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    console.log('🚀 Starting application...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    await startServer(PORT);

    console.log('✅ Application started successfully');
  } catch (error) {
    console.error('❌ Application failed to start');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
