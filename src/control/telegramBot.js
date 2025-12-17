/**
 * src/control/telegramBot.js
 * Telegram Control Bot
 *
 * مسؤول عن:
 * - إنشاء بوت تيليجرام للتحكم
 * - عرض الأزرار الرئيسية
 * - ربط الأزرار بوظائف المحرك
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const TelegramBot = require('node-telegram-bot-api');

// ============================
// استيراد وحدات النظام
// ============================
const { exportAllSections } = require('../export/exportTxt');
const { startPublishing } = require('../publisher/autoPublish');
const { stop } = require('../publisher/stopPublish');
const { generateReportFile } = require('../reports/joinReport');

// ============================
// إعدادات تيليجرام
// ============================
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_ID = process.env.TELEGRAM_OWNER_ID;

if (!BOT_TOKEN || !OWNER_ID) {
    console.warn('[TELEGRAM] Bot token or owner ID not set');
    return;
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
function isOwner(msg) {
    return String(msg.chat.id) === String(OWNER_ID);
}

// ============================
// القائمة الرئيسية
// ============================
function mainMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔗 ربط حساب واتساب', callback_data: 'wa_link' }],
                [
                    { text: '📥 عرض الروابط', callback_data: 'links_show' },
                    { text: '📤 تصدير الروابط', callback_data: 'links_export' }
                ],
                [
                    { text: '🚀 بدء النشر', callback_data: 'publish_start' },
                    { text: '⛔ إيقاف النشر', callback_data: 'publish_stop' }
                ],
                [
                    { text: '➕ الانضمام للمجموعات', callback_data: 'groups_join' },
                    { text: '📊 تقرير الانضمام', callback_data: 'groups_report' }
                ]
            ]
        }
    };
}

// ============================
// أمر /start
// ============================
bot.onText(/\/start/, (msg) => {
    if (!isOwner(msg)) return;

    bot.sendMessage(
        msg.chat.id,
        '👋 مرحبًا بك في لوحة التحكم\nاختر العملية:',
        mainMenu()
    );

    log('INFO', 'Control panel opened');
});

// ============================
// التعامل مع الأزرار
// ============================
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    if (String(chatId) !== String(OWNER_ID)) return;

    const action = query.data;

    try {
        switch (action) {
            case 'links_export':
                await exportAllSections();
                bot.sendMessage(chatId, '✅ تم تصدير الروابط بنجاح');
                break;

            case 'publish_start':
                bot.sendMessage(
                    chatId,
                    '⚠️ بدء النشر يتطلب تحديد الإعلان (سيتم ربطه لاحقًا)'
                );
                break;

            case 'publish_stop':
                stop();
                bot.sendMessage(chatId, '⛔ تم إيقاف النشر');
                break;

            case 'groups_report': {
                const filePath = await generateReportFile();
                if (filePath) {
                    bot.sendDocument(chatId, filePath);
                } else {
                    bot.sendMessage(chatId, 'لا يوجد تقرير متاح');
                }
                break;
            }

            default:
                bot.sendMessage(chatId, '⚠️ خيار غير معروف');
        }
    } catch (err) {
        bot.sendMessage(chatId, '❌ حدث خطأ أثناء التنفيذ');
        log('ERROR', err.message);
    }

    bot.answerCallbackQuery(query.id);
});

// ============================
// جاهزية البوت
// ============================
log('READY', 'Telegram control bot is running');
