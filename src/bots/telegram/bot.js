const TelegramBot = require('node-telegram-bot-api');
const { handleMessage } = require('./handlers');

function startTelegramBot(token) {
  const bot = new TelegramBot(token, { polling: true });

  bot.on('message', (msg) => {
    if (!msg.text) return;
    handleMessage(bot, msg);
  });

  console.log('🤖 Telegram bot started');
}

module.exports = startTelegramBot;
