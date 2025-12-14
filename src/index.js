/**
 * Application Entry Point
 * Stage 1 + Stage 2
 */

require('dotenv').config();

const { startServer } = require('./web/server');
const { connectDatabase } = require('./config/database');
const db = require('./models');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    console.log('🚀 Starting application...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Connect database
    await connectDatabase();

    // Sync database models
    await db.sequelize.sync();

    console.log('📦 Database synced successfully');

    // Start Express server
    await startServer(PORT);

    console.log('✅ Application started successfully');
  } catch (error) {
    console.error('❌ Application failed to start');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
