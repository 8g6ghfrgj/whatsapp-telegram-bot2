/**
 * Telegram Callback Handlers
 * Stage 5
 */

const {
  createWhatsAppSession,
  listWhatsAppSessions,
  deleteWhatsAppSession
} = require('../whatsapp/session');

async function handleCallbacks(bot, query) {
  const chatId = query.message.chat.id;
  const telegramId = query.from.id.toString();
  const action = query.data;

  await bot.answerCallbackQuery(query.id);

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
      return bot.sendMessage(chatId, '🔍 سيتم تفعيله لاحقاً');

    case 'show_links':
      return bot.sendMessage(chatId, '📂 سيتم تفعيله لاحقاً');

    default:
      return bot.sendMessage(chatId, '❓ أمر غير معروف');
  }
}

module.exports = {
  handleCallbacks
};
