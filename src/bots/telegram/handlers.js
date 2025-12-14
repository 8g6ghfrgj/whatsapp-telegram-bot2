/**
 * Telegram Callback Handlers
 * Stage 5 + 6 + 7
 */

const {
  createWhatsAppSession,
  listWhatsAppSessions,
  deleteWhatsAppSession
} = require('../whatsapp/session');

const { CollectedLink, Advertisement } = require('../../models');
const {
  createAd,
  listAds,
  deleteAd
} = require('../../services/adsService');

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
    const sessionId = action.split(':')[1];
    return deleteWhatsAppSession(bot, chatId, sessionId);
  }

  // ===============================
  // Links
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
      message += `🔗 ${link.url}\n📌 النوع: ${link.type}\n\n`;
    }

    return bot.sendMessage(chatId, message);
  }

  // ===============================
  // Advertisements (Stage 7)
  // ===============================
  if (action === 'add_ad') {
    setUserState(telegramId, 'awaiting_ad_content');
    return bot.sendMessage(
      chatId,
      '📝 أرسل الآن الإعلان (نص / صورة / فيديو / جهة اتصال)'
    );
  }

  if (action === 'list_ads') {
    const ads = await listAds(telegramId);

    if (!ads.length) {
      return bot.sendMessage(chatId, '📢 لا توجد إعلانات محفوظة');
    }

    for (const ad of ads) {
      await bot.sendMessage(
        chatId,
        `📢 إعلان #${ad.id}\n📌 النوع: ${ad.type}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '❌ حذف الإعلان',
                  callback_data: `delete_ad:${ad.id}`
                }
              ]
            ]
          }
        );
      }
    }
    return;
  }

  if (action.startsWith('delete_ad:')) {
    const adId = action.split(':')[1];
    await deleteAd(adId, telegramId);
    return bot.sendMessage(chatId, '🗑️ تم حذف الإعلان');
  }

  // ===============================
  // Placeholder
  // ===============================
  return bot.sendMessage(chatId, '⚙️ سيتم تفعيل هذه الميزة لاحقاً');
}

module.exports = {
  handleCallbacks
};
