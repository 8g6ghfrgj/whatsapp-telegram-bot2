/**
 * Telegram Callback Handlers
 * Complete version (Stages 5 → 9)
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
  setUserState
} = require('./states');

async function handleCallbacks(bot, query) {
  const chatId = query.message.chat.id;
  const telegramId = query.from.id.toString();
  const action = query.data;

  // ✅ حل مشكلة callback expired
  try {
    await bot.answerCallbackQuery(query.id);
  } catch (err) {
    // تجاهل الخطأ إذا كان الزر قديم أو انتهت صلاحيته
  }

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
    const sessionId = action.split(':')[1];
    return deleteWhatsAppSession(bot, chatId, sessionId);
  }

  // ===============================
  // Auto Post (Stage 8)
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
      '🔗 أرسل روابط مجموعات واتساب (يمكنك إرسال عدد كبير في رسالة واحدة)'
    );
  }

  // ===============================
  // Collected Links (Stage 6)
  // ===============================
  if (action === 'show_links') {
    const links = await CollectedLink.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    if (!links.length) {
      return bot.sendMessage(chatId, '📂 لا توجد روابط مجمعة');
    }

    let message = '📂 آخر الروابط المجمعة:\n\n';

    for (const link of links) {
      let icon = '🌐';
      if (link.type === 'whatsapp') icon = '🟢';
      if (link.type === 'telegram') icon = '🔵';

      message += `${icon} ${link.url}\n📌 النوع: ${link.type}\n\n`;
    }

    return bot.sendMessage(chatId, message);
  }

  // ===============================
  // Default
  // ===============================
  return bot.sendMessage(chatId, '⚙️ هذه الميزة سيتم تفعيلها لاحقاً');
}

module.exports = {
  handleCallbacks
};
