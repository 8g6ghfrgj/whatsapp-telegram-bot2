/**
 * Telegram Callback Handlers
 * Stage 3 + Stage 4
 */

const { createWhatsAppSession } = require('../whatsapp/session');

async function handleCallbacks(bot, query) {
  const chatId = query.message.chat.id;
  const action = query.data;

  // تأكيد الضغط على الزر
  await bot.answerCallbackQuery(query.id);

  switch (action) {
    case 'add_account':
      return createWhatsAppSession(bot, chatId);

    case 'list_accounts':
      return bot.sendMessage(chatId, '📱 لا توجد حسابات مرتبطة حالياً');

    case 'start_autopost':
      return bot.sendMessage(chatId, '📢 النشر التلقائي سيتم تفعيله لاحقاً');

    case 'stop_autopost':
      return bot.sendMessage(chatId, '⛔ إيقاف النشر التلقائي سيتم تفعيله لاحقاً');

    case 'join_groups':
      return bot.sendMessage(chatId, '👥 الانضمام لمجموعات واتساب سيتم تفعيله لاحقاً');

    case 'groups_report':
      return bot.sendMessage(chatId, '📊 تقرير المجموعات سيتم تفعيله لاحقاً');

    case 'collect_links':
      return bot.sendMessage(chatId, '🔍 تجميع الروابط سيتم تفعيله لاحقاً');

    case 'show_links':
      return bot.sendMessage(chatId, '📂 عرض الروابط سيتم تفعيله لاحقاً');

    default:
      return bot.sendMessage(chatId, '❓ أمر غير معروف');
  }
}

module.exports = {
  handleCallbacks
};
