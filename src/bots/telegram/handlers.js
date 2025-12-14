/**
 * Telegram Callback Handlers
 */

async function handleCallbacks(bot, query) {
  const chatId = query.message.chat.id;
  const action = query.data;

  // Acknowledge callback
  await bot.answerCallbackQuery(query.id);

  switch (action) {
    case 'add_account':
      return bot.sendMessage(chatId, '🔗 ربط الحساب (سيتم تفعيله لاحقاً)');

    case 'list_accounts':
      return bot.sendMessage(chatId, '📱 عرض الحسابات المرتبطة (قريباً)');

    case 'start_autopost':
      return bot.sendMessage(chatId, '📢 تشغيل النشر التلقائي (قريباً)');

    case 'stop_autopost':
      return bot.sendMessage(chatId, '⛔ إيقاف النشر التلقائي (قريباً)');

    case 'join_groups':
      return bot.sendMessage(chatId, '👥 الانضمام لمجموعات واتساب (قريباً)');

    case 'groups_report':
      return bot.sendMessage(chatId, '📊 تقرير المجموعات (قريباً)');

    case 'collect_links':
      return bot.sendMessage(chatId, '🔍 تجميع الروابط (قريباً)');

    case 'show_links':
      return bot.sendMessage(chatId, '📂 عرض الروابط (قريباً)');

    default:
      return bot.sendMessage(chatId, '❓ أمر غير معروف');
  }
}

module.exports = {
  handleCallbacks
};
