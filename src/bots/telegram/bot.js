/**
 * Telegram Bot Initialization
 * Stage 3 + 7
 */

const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_BOT_TOKEN } = process.env;

const { mainMenu } = require('./menus');
const { handleCallbacks } = require('./handlers');

const {
  initStates,
  getUserState,
  clearUserState
} = require('./states');

const { createAd } = require('../../services/adsService');

let bot;

function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
  }

  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
    polling: true
  });

  console.log('🤖 Telegram bot started');

  // Initialize FSM states
  initStates();

  // ===============================
  // /start command
  // ===============================
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

  // ===============================
  // Listener: Receive Ad Content
  // (Added directly under /start)
  // ===============================
  bot.on('message', async (msg) => {
    const telegramId = msg.from.id.toString();
    const chatId = msg.chat.id;

    const state = getUserState(telegramId);
    if (!state || state.state !== 'awaiting_ad_content') return;

    let type = 'text';
    let content = msg.text || '';

    if (msg.photo) {
      type = 'image';
      content = msg.photo[msg.photo.length - 1].file_id;
    } else if (msg.video) {
      type = 'video';
      content = msg.video.file_id;
    } else if (msg.contact) {
      type = 'contact';
      content = JSON.stringify(msg.contact);
    }

    await createAd(telegramId, type, content);
    clearUserState(telegramId);

    await bot.sendMessage(chatId, '✅ تم حفظ الإعلان بنجاح');
  });

  // ===============================
  // Callback Queries
  // ===============================
  bot.on('callback_query', async (query) => {
    await handleCallbacks(bot, query);
  });

  return bot;
}

module.exports = {
  startTelegramBot
};
