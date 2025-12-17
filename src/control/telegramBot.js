/**
 * src/control/telegramBot.js
 * Telegram Control Bot (Final)
 *
 * لوحة التحكم الرئيسية للبوت
 * - عرض الأزرار
 * - تمرير الأزرار إلى handlers
 * - تمرير الرسائل النصية
 *
 * هذا الملف نهائي
 */

'use strict';

const TelegramBot = require('node-telegram-bot-api');

// ============================
// استيراد الواجهة والمنطق
// ============================
const buttons = require('./buttons');
const handlers = require('./handlers');

// ============================
// إعدادات تيليجرام
// ============================
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_ID = process.env.TELEGRAM_OWNER_ID;

if (!BOT_TOKEN || !OWNER_ID) {
    console.error(
        '[TELEGRAM] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_OWNER_ID'
    );
    process.exit(1);
}

// ============================
// إنشاء البوت
// ============================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [TELEGRAM:${level}] ${message}`);
}

// ============================
// التحقق من المالك
// ============================
function isOwner(chatId) {
    return String(chatId) === String(OWNER_ID);
}

// ============================
// أمر /start
// ============================
bot.onText(/\/start/, (msg) => {
    if (!isOwner(msg.chat.id)) return;

    bot.sendMessage(
        msg.chat.id,
        '👋 مرحبًا بك في لوحة التحكم\nاختر العملية:',
        buttons.mainMenu()
    );

    log('INFO', 'Main menu opened');
});

// ============================
// أزرار Inline
// ============================
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    if (!isOwner(chatId)) return;

    await handlers.handleCallback(bot, query);
});

// ============================
// الرسائل النصية (مثل روابط المجموعات)
// ============================
bot.on('message', async (msg) => {
    if (!isOwner(msg.chat.id)) return;
    if (!msg.text || msg.text.startsWith('/')) return;

    await handlers.handleMessage(bot, msg);
});

// ============================
// جاهزية البوت
// ============================
log('READY', 'Telegram control bot is ready');
