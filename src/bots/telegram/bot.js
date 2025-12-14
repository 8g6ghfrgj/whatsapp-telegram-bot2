/**
 * Telegram Bot Initialization
 * Stages 3 → 9
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
const { startJoinQueue } = require('../../services/autoJoinService');
const whatsappManager = require('../whatsapp/manager');

let bot;

function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined');
  }

  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
    polling: true
  });

  console.log('🤖 Telegram bot started');

  // تهيئة حالات المستخدم
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
  // Messages Listener (FSM)
  // ===============================
  bot.on('message', async (msg) => {
    const telegramId = msg.from.id.toString();
    const chatId = msg.chat.id;

    const state = getUserState(telegramId);
    if (!state) return;

    // ===============================
    // Auto Join (Stage 9)
    // ===============================
    if (state.state === 'awaiting_join_links') {
      const clients = [...whatsappManager.clients.values()];

      if (!clients.length) {
        clearUserState(telegramId);
        return bot.sendMessage(chatId, '❌ لا يوجد حساب واتساب مرتبط');
      }

      clearUserState(telegramId);

      return startJoinQueue({
        bot,
        chatId,
        telegramId,
        waClient: clients[0],
        text: msg.text
      });
    }

    // ===============================
    // Add Advertisement (Stage 7)
    // ===============================
    if (state.state === 'awaiting_ad_content') {
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

      return bot.sendMessage(chatId, '✅ تم حفظ الإعلان بنجاح');
    }
  });

  // ===============================
  // Callback Queries (Buttons)
  // ===============================
  bot.on('callback_query', async (query) => {
    await handleCallbacks(bot, query);
  });

  return bot;
}

module.exports = {
  startTelegramBot
};
