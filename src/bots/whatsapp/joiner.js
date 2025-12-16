const delay = require('../../utils/delay');
const { createClient } = require('./manager');
const joinService = require('../../services/joinService');

let running = false;

async function startJoining(bot, chatId, links) {
  if (running) {
    bot.sendMessage(chatId, '⏳ الانضمام قيد التنفيذ بالفعل');
    return;
  }

  running = true;
  const client = createClient();

  bot.sendMessage(chatId, `🔄 بدء الانضمام إلى ${links.length} مجموعة`);

  for (const link of links) {
    try {
      joinService.addPending(link);
      await client.acceptInvite(link);
      await delay(2 * 60 * 1000);
    } catch (e) {
      console.error('Join error:', e.message);
    }
  }

  running = false;
  bot.sendMessage(chatId, '✅ انتهت محاولة الانضمام لكل الروابط');
}

module.exports = {
  startJoining
};
