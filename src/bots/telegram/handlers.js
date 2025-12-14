/**
 * Telegram Callback Handlers
 * Stage 5 → 9
 */

const {
  createWhatsAppSession,
  listWhatsAppSessions,
  deleteWhatsAppSession
} = require('../whatsapp/session');

const whatsappManager = require('../whatsapp/manager');
const { CollectedLink } = require('../../models');

const {
  startAutoPost,
  stopAutoPost
} = require('../../services/autoPostService');

const { startJoinQueue } = require('../../services/autoJoinService');
const {
  setUserState,
  getUserState,
  clearUserState
} = require('./states');

async function handleCallbacks(bot, query) {
  const chatId = query.message.chat.id;
  const telegramId = query.from.id.toString();
  const action = query.data;

  await bot.answerCallbackQuery(query.id);

  // ===============================
  // WhatsApp Sessions
  // ===============================
  if (action === 'add_account') {
    return createWhatsAppSession(bot, chatId, telegramId);
  }

  if (action === 'list_accounts') {
    return listWhatsAppSessions(bot, chatId, telegramId);
  }

  if (action.startsWith('delete_session:')) {
    return deleteWhatsAppSession(
      bot,
      chatId,
      action.split(':')[1]
    );
  }

  // ===============================
  // Auto Post
  // ===============================
  if (action === 'start_autopost') {
    const clients = [...whatsappManager.clients.values()];
    if (!clients.length) {
      return bot.sendMessage(chatId, '❌ لا يوجد حساب واتساب مرتبط');
    }

    return startAutoPost({
      bot,
      chatId,
      telegramId,
      waClient: clients[0]
    });
  }

  if (action === 'stop_autopost') {
    return stopAutoPost(bot, chatId, telegramId);
  }

  // ===============================
  // Auto Join (Stage 9)
  // ===============================
  if (action === 'join_groups') {
    setUserState(telegramId, 'awaiting_join_links');
    return bot.sendMessage(
      chatId,
      '🔗 أرسل روابط مجموعات واتساب (حتى 1000 رابط في رسالة واحدة)'
    );
  }

  // ===============================
  // Links Viewer
  // ===============================
  if (action === 'show_links') {
    const links = await CollectedLink.findAll({ limit: 20 });
    if (!links.length) {
      return bot.sendMessage(chatId, '📂 لا توجد روابط');
    }

    let msg = '📂 الروابط:\n\n';
    for (const l of links) {
      msg += `🔗 ${l.url}\n\n`;
    }
    return bot.sendMessage(chatId, msg);
  }

  return bot.sendMessage(chatId, '⚙️ سيتم تفعيل هذه الميزة لاحقاً');
}

module.exports = {
  handleCallbacks
};
