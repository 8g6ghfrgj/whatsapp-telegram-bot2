/**
 * Telegram Bot Initialization
 * Stage 3: Telegram Only
 */

const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_BOT_TOKEN } = process.env;
const { mainMenu } = require('./menus');
const { handleCallbacks } = require('./handlers');
const { initStates } = require('./states');

let bot;

function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
  }

  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
    polling: true
  });

  console.log('🤖 Telegram bot started');

  // Initialize user states
  initStates();

  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      '👋 مرحباً بك في البوت\n\nاختر من القائمة:',
      {
        reply_markup: mainMenu
      }
    );
  });

  // Callbacks
  bot.on('callback_query', async (query) => {
    await handleCallbacks(bot, query);
  });

  return bot;
}

module.exports = {
  startTelegramBot
};
