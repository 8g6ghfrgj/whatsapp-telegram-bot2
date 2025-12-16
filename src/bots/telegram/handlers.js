طconst { mainKeyboard } = require('./keyboards');
const { setState, getState, clearState } = require('./states');

/* WhatsApp */
const {
  startWhatsAppSession,
  logoutWhatsApp
} = require('../whatsapp/session');
const accountService = require('../../services/whatsappAccountService');
const collector = require('../whatsapp/collector');
const { startPosting, stopPosting } = require('../whatsapp/poster');
const { startJoining } = require('../whatsapp/joiner');

/* Services */
const linkService = require('../../services/linkService');
const { exportLinks } = require('../../services/exportService');
const adService = require('../../services/adService');
const replyService = require('../../services/replyService');

/* Utils */
const isWhatsAppGroupLink = require('../../utils/isWhatsAppGroupLink');

async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text?.trim();
  const state = getState(userId);

  /* =========================
     STATES HANDLING
  ==========================*/

  // إضافة إعلان
  if (state?.state === 'WAIT_AD_TEXT') {
    adService.setAd(text);
    clearState(userId);
    bot.sendMessage(chatId, '✅ تم حفظ الإعلان بنجاح');
    return;
  }

  // رد الخاص
  if (state?.state === 'WAIT_PRIVATE_REPLY') {
    replyService.setPrivateReply(text);
    clearState(userId);
    bot.sendMessage(chatId, '✅ تم حفظ رد الخاص');
    return;
  }

  // رد القروبات
  if (state?.state === 'WAIT_GROUP_REPLY') {
    replyService.setGroupReply(text);
    clearState(userId);
    bot.sendMessage(chatId, '✅ تم حفظ رد القروبات');
    return;
  }

  // استقبال روابط مجموعات واتساب
  if (state?.state === 'WAIT_GROUP_LINKS') {
    const links = text
      .split(/\s+/)
      .filter(isWhatsAppGroupLink);

    clearState(userId);

    if (!links.length) {
      bot.sendMessage(chatId, '❌ لم يتم العثور على روابط مجموعات واتساب');
      return;
    }

    startJoining(bot, chatId, links);
    return;
  }

  /* =========================
     COMMANDS
  ==========================*/

  switch (text) {
    case '/start':
      clearState(userId);
      bot.sendMessage(
        chatId,
        '👋 أهلاً بك في بوت إدارة واتساب\nاختر من القائمة:',
        mainKeyboard()
      );
      break;

    /* ===== WhatsApp ===== */

    case '🔗 ربط حساب واتساب':
      if (accountService.isConnected()) {
        bot.sendMessage(chatId, '✅ واتساب مرتبط بالفعل');
        return;
      }
      startWhatsAppSession(bot, chatId);
      break;

    case '📱 عرض الحسابات المرتبطة': {
      const status = accountService.getStatus();
      let msgText = '📱 حالة واتساب:\n\n';

      if (status.status === 'connected') {
        msgText += `✅ متصل\n⏰ منذ: ${status.connectedAt.toLocaleString()}`;
      } else if (status.status === 'pending') {
        msgText += '⏳ جاري الربط...';
      } else {
        msgText += '❌ غير مرتبط';
      }

      bot.sendMessage(chatId, msgText);
      break;
    }

    case '🚪 تسجيل خروج واتساب':
      logoutWhatsApp(bot, chatId);
      break;

    /* ===== Link Collection ===== */

    case '🔍 تجميع الروابط':
      if (!accountService.isConnected()) {
        bot.sendMessage(chatId, '❌ اربط واتساب أولاً');
        return;
      }
      collector.startCollecting();
      bot.sendMessage(chatId, '🔍 تم تشغيل تجميع الروابط');
      break;

    case '⛔ توقيف الجمع':
      collector.stopCollecting();
      bot.sendMessage(chatId, '⛔ تم إيقاف تجميع الروابط');
      break;

    case '📂 عرض الروابط المجمعة': {
      const all = linkService.getAll();
      bot.sendMessage(
        chatId,
        `📂 الروابط المجمعة:\n\n` +
        `🔗 واتساب: ${all.whatsapp.length}\n` +
        `📨 تيليجرام: ${all.telegram.length}\n` +
        `🌐 أخرى: ${all.other.length}`
      );
      break;
    }

    case '📤 تصدير الروابط المجمعة': {
      const files = exportLinks();
      if (!files.length) {
        bot.sendMessage(chatId, '❌ لا توجد روابط للتصدير');
        return;
      }
      for (const f of files) {
        await bot.sendDocument(chatId, f.filePath);
      }
      break;
    }

    /* ===== Posting ===== */

    case '📣 نشر تلقائي':
      setState(userId, 'WAIT_AD_TEXT');
      bot.sendMessage(chatId, '✏️ أرسل نص الإعلان الآن');
      break;

    case '🛑 إيقاف النشر التلقائي':
      stopPosting(bot, chatId);
      break;

    /* ===== Replies ===== */

    case '💬 الردود':
      bot.sendMessage(
        chatId,
        'اختر:\n\n' +
        '✉️ رد الخاص\n' +
        '👥 رد القروبات\n' +
        '⛔ إيقاف رد الخاص\n' +
        '⛔ إيقاف رد القروبات'
      );
      break;

    case '✉️ رد الخاص':
      setState(userId, 'WAIT_PRIVATE_REPLY');
      bot.sendMessage(chatId, '✏️ أرسل نص رد الخاص');
      break;

    case '👥 رد القروبات':
      setState(userId, 'WAIT_GROUP_REPLY');
      bot.sendMessage(chatId, '✏️ أرسل نص رد القروبات');
      break;

    case '⛔ إيقاف رد الخاص':
      replyService.disablePrivateReply();
      bot.sendMessage(chatId, '⛔ تم إيقاف رد الخاص');
      break;

    case '⛔ إيقاف رد القروبات':
      replyService.disableGroupReply();
      bot.sendMessage(chatId, '⛔ تم إيقاف رد القروبات');
      break;

    /* ===== Join Groups ===== */

    case '➕ الانضمام إلى المجموعات':
      if (!accountService.isConnected()) {
        bot.sendMessage(chatId, '❌ اربط واتساب أولاً');
        return;
      }
      setState(userId, 'WAIT_GROUP_LINKS');
      bot.sendMessage(chatId, '🔗 أرسل روابط مجموعات واتساب');
      break;

    default:
      bot.sendMessage(chatId, '❓ استخدم الأزرار المتاحة');
  }
}

module.exports = {
  handleMessage
};
