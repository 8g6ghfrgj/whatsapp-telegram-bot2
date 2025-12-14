/**
 * Telegram Callback Handlers
 * Stage 5 + Stage 6
 */

const {
  createWhatsAppSession,
  listWhatsAppSessions,
  deleteWhatsAppSession
} = require('../whatsapp/session');

const { CollectedLink } = require('../../models');

async function handleCallbacks(bot, query) {
  const chatId = query.message.chat.id;
  const telegramId = query.from.id.toString();
  const action = query.data;

  // تأكيد الضغط على الزر
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
    const sessionId = action.split(':')[1];
    return deleteWhatsAppSession(bot, chatId, sessionId);
  }

  // ===============================
  // Links (Stage 6)
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
  // Placeholder for next stages
  // ===============================
  switch (action) {
    case 'start_autopost':
      return bot.sendMessage(chatId, '📢 سيتم تفعيله لاحقاً');

    case 'stop_autopost':
      return bot.sendMessage(chatId, '⛔ سيتم تفعيله لاحقاً');

    case 'join_groups':
      return bot.sendMessage(chatId, '👥 سيتم تفعيله لاحقاً');

    case 'groups_report':
      return bot.sendMessage(chatId, '📊 سيتم تفعيله لاحقاً');

    case 'collect_links':
      return bot.sendMessage(chatId, '🔍 يتم التجميع تلقائياً من واتساب');

    default:
      return bot.sendMessage(chatId, '❓ أمر غير معروف');
  }
}

module.exports = {
  handleCallbacks
};
