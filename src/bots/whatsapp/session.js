/**
 * WhatsApp Session Controller
 * Stage 5: Save / List / Delete Sessions
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const whatsappManager = require('./manager');
const { generateQRImage } = require('./qr');
const { WhatsAppSession } = require('../../models');

async function createWhatsAppSession(bot, chatId, telegramId) {
  const sessionId = `wa_${crypto.randomBytes(6).toString('hex')}`;
  const client = whatsappManager.createClient(sessionId);

  await WhatsAppSession.create({
    id: sessionId,
    adminTelegramId: telegramId,
    status: 'pending'
  });

  client.on('qr', async (qr) => {
    const qrImage = await generateQRImage(qr);
    await bot.sendPhoto(chatId, qrImage, {
      caption:
        '📱 امسح QR من واتساب\n' +
        'الإعدادات → الأجهزة المرتبطة → ربط جهاز'
    });
  });

  client.on('ready', async () => {
    await WhatsAppSession.update(
      {
        status: 'connected',
        connectedAt: new Date()
      },
      { where: { id: sessionId } }
    );

    await bot.sendMessage(chatId, '✅ تم ربط حساب واتساب بنجاح');
  });

  client.on('disconnected', async () => {
    await WhatsAppSession.update(
      { status: 'disconnected' },
      { where: { id: sessionId } }
    );
  });

  await client.initialize();
}

async function listWhatsAppSessions(bot, chatId, telegramId) {
  const sessions = await WhatsAppSession.findAll({
    where: { adminTelegramId: telegramId }
  });

  if (!sessions.length) {
    return bot.sendMessage(chatId, '📱 لا توجد حسابات مرتبطة');
  }

  for (const session of sessions) {
    await bot.sendMessage(
      chatId,
      `📱 الحساب: ${session.id}\n` +
        `📊 الحالة: ${session.status}\n` +
        `⏰ تاريخ الربط: ${session.connectedAt || '—'}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '❌ حذف الحساب',
                callback_data: `delete_session:${session.id}`
              }
            ]
          ]
        }
      }
    );
  }
}

async function deleteWhatsAppSession(bot, chatId, sessionId) {
  const client = whatsappManager.getClient(sessionId);

  if (client) {
    await client.destroy();
  }

  await WhatsAppSession.destroy({ where: { id: sessionId } });

  const sessionPath = path.join(process.cwd(), 'sessions', sessionId);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
  }

  await bot.sendMessage(chatId, '🗑️ تم حذف حساب واتساب بنجاح');
}

module.exports = {
  createWhatsAppSession,
  listWhatsAppSessions,
  deleteWhatsAppSession
};
