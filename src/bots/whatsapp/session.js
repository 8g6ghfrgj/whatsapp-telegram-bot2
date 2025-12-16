const { createClient, destroyClient } = require('./manager');
const { generateQR } = require('./qr');
const accountService = require('../../services/whatsappAccountService');
const { registerWhatsAppListeners } = require('./listeners');

let qrSent = false;

async function startWhatsAppSession(bot, chatId) {
  const client = createClient();
  accountService.setPending();

  client.on('qr', async (qr) => {
    if (qrSent) return;
    qrSent = true;

    const qrImage = await generateQR(qr);
    await bot.sendPhoto(chatId, qrImage, {
      caption:
        '📱 امسح QR من واتساب\n' +
        'الإعدادات → الأجهزة المرتبطة → ربط جهاز'
    });
  });

  client.on('ready', async () => {
    qrSent = false;
    accountService.setConnected();
    registerWhatsAppListeners(client);
    await bot.sendMessage(chatId, '✅ تم ربط حساب واتساب بنجاح');
  });

  client.on('disconnected', async () => {
    qrSent = false;
    accountService.setDisconnected();
    await bot.sendMessage(chatId, '⚠️ تم فصل حساب واتساب');
  });

  if (!client.__initialized) {
    client.__initialized = true;
    await client.initialize();
  }
}

function logoutWhatsApp(bot, chatId) {
  destroyClient();
  accountService.setDisconnected();
  bot.sendMessage(chatId, '🚪 تم تسجيل الخروج من واتساب');
}

module.exports = {
  startWhatsAppSession,
  logoutWhatsApp
};
