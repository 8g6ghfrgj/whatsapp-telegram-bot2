/**
 * Auto Post Service
 * Infinite cycles with 1 second delay
 */

const { Advertisement } = require('../models');

const activeAutoPosts = new Map(); 
// telegramId => { stop: boolean }

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startAutoPost({ bot, chatId, telegramId, waClient }) {
  // إذا كان النشر شغال
  if (activeAutoPosts.has(telegramId)) {
    return bot.sendMessage(chatId, '⚠️ النشر التلقائي يعمل بالفعل');
  }

  activeAutoPosts.set(telegramId, { stop: false });
  await bot.sendMessage(chatId, '🚀 تم تشغيل النشر التلقائي');

  // جلب آخر إعلان
  const ads = await Advertisement.findAll({
    where: { adminTelegramId: telegramId },
    order: [['createdAt', 'DESC']]
  });

  if (!ads.length) {
    activeAutoPosts.delete(telegramId);
    return bot.sendMessage(chatId, '❌ لا يوجد إعلان للنشر');
  }

  const ad = ads[0];

  // دورات لا نهائية
  while (!activeAutoPosts.get(telegramId)?.stop) {
    const chats = await waClient.getChats();
    const groups = chats.filter((chat) => chat.isGroup);

    for (const group of groups) {
      if (activeAutoPosts.get(telegramId)?.stop) break;

      try {
        await waClient.sendMessage(
          group.id._serialized,
          ad.content
        );

        await delay(1000); // فارق 1 ثانية
      } catch (err) {
        console.error('❌ AutoPost error:', err.message);
      }
    }
  }

  activeAutoPosts.delete(telegramId);
}

function stopAutoPost(bot, chatId, telegramId) {
  if (!activeAutoPosts.has(telegramId)) {
    return bot.sendMessage(chatId, '⚠️ النشر غير مفعل حالياً');
  }

  activeAutoPosts.get(telegramId).stop = true;
  bot.sendMessage(chatId, '⛔ تم إيقاف النشر التلقائي');
}

module.exports = {
  startAutoPost,
  stopAutoPost
};
