/**
 * WhatsApp Session Controller
 */

const crypto = require('crypto');
const whatsappManager = require('./manager');
const { generateQRImage } = require('./qr');

async function createWhatsAppSession(bot, chatId) {
  const sessionId = `wa_${crypto.randomBytes(6).toString('hex')}`;
  const client = whatsappManager.createClient(sessionId);

  client.on('qr', async (qr) => {
    const qrImage = await generateQRImage(qr);

    await bot.sendPhoto(chatId, qrImage, {
      caption:
        '📱 امسح QR من واتساب\n\n' +
        'WhatsApp → الإعدادات → الأجهزة المرتبطة → ربط جهاز'
    });
  });

  client.on('ready', async () => {
    await bot.sendMessage(chatId, '✅ تم ربط حساب واتساب بنجاح');
  });

  client.on('disconnected', async () => {
    await bot.sendMessage(chatId, '⚠️ تم فصل جلسة واتساب');
  });

  await client.initialize();
}

module.exports = {
  createWhatsAppSession
};
