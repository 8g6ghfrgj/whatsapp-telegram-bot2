/**
 * Auto Post Service
 * Infinite cycles with 1 second delay
 */

const { Advertisement } = require('../models');

const activeAutoPosts = new Map(); // telegramId => { stop: boolean }

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function startAutoPost({
  bot,
  chatId,
  telegramId,
  waClient
}) {
  if (activeAutoPosts.has(telegramId)) {
    return bot.sendMessage(chatId, '⚠️ النشر التلقائي يعمل بالفعل');
  }

  activeAutoPosts.set(telegramId, { stop: false });
  bot.sendMessage(chatId, '🚀 تم تشغيل النشر التلقائي');

  const ads = await Advertisement.findAll({
    where: { adminTelegramId: telegramId },
    order: [['createdAt', 'DESC']]
  });

  if (!ads.length) {
    activeAutoPosts.delete(telegramId);
    return bot.sendMessage(chatId, '❌ لا يوجد إعلان للنشر');
  }

  const ad = ads[0]; // آخر إعلان

  while (!activeAutoPosts.get(telegramId)?.stop) {
    const chats = await waClient.getChats();
    const groups = chats.filter((c) => c.isGroup);

    for (const group of groups) {
      if (activeAutoPosts.get(telegramId)?.stop) break;

      try {
        if (ad.type === 'text') {
          await waClient.sendMessage(group.id._serialized, ad.content);
        }

        if (ad.type === 'image') {
          await waClient.sendMessage(
            group.id._serialized,
            new (require('whatsapp-web.js').MessageMedia)(
              'image/jpeg',
              ad.content
            )
          );
        }

        if (ad.type === 'video') {
          await waClient.sendMessage(
            group.id._serialized,
            new (require('whatsapp-web.js').MessageMedia)(
              'video/mp4',
              ad.content
            )
          );
        }

        await delay(1000); // 1 second delay
      } catch (err) {
        console.error('AutoPost Error:', err.message);
      }
    }
  }

  activeAutoPosts.delete(telegramId);
}

function stopAutoPost(bot, chatId, telegramId) {
  if (!activeAutoPosts.has(telegramId)) {
    return bot.sendMessage(chatId, '⚠️ النشر غير مفعل');
  }

  activeAutoPosts.get(telegramId).stop = true;
  bot.sendMessage(chatId, '⛔ تم إيقاف النشر التلقائي');
}

module.exports = {
  startAutoPost,
  stopAutoPost
};
