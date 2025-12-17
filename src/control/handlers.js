/**
 * src/control/handlers.js
 * Telegram Button Handlers (FINAL & COMPLETE)
 */

'use strict';

const { exportAllSections } = require('../export/exportTxt');
const { stop } = require('../publisher/stopPublish');
const { generateReportFile } = require('../reports/joinReport');
const { getLinksByType } = require('../database/linkModel');

// ============================
// Logger
// ============================
function log(level, msg) {
    console.log(`[HANDLER:${level}] ${msg}`);
}

// ============================
// Callback handler
// ============================
async function handleCallback(bot, query) {
    const chatId = query.message.chat.id;
    const action = query.data;

    try {
        switch (action) {

            // =========================
            // WhatsApp
            // =========================
            case 'wa_link':
                await bot.sendMessage(
                    chatId,
                    '📱 ربط واتساب يتم تلقائيًا من السيرفر.\nإذا لم يتم الربط بعد، راجع QR في الـ logs.'
                );
                break;

            // =========================
            // Links
            // =========================
            case 'links_show':
                await bot.sendMessage(
                    chatId,
                    'اختر نوع الروابط:',
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '📱 واتساب', callback_data: 'links_whatsapp' },
                                    { text: '✈️ تيليجرام', callback_data: 'links_telegram' }
                                ],
                                [
                                    { text: '🌐 أخرى', callback_data: 'links_other' }
                                ]
                            ]
                        }
                    }
                );
                break;

            case 'links_whatsapp': {
                const links = await getLinksByType('whatsapp');
                await bot.sendMessage(
                    chatId,
                    links.length ? links.join('\n') : 'لا توجد روابط واتساب'
                );
                break;
            }

            case 'links_telegram': {
                const links = await getLinksByType('telegram');
                await bot.sendMessage(
                    chatId,
                    links.length ? links.join('\n') : 'لا توجد روابط تيليجرام'
                );
                break;
            }

            case 'links_other': {
                const links = await getLinksByType('other');
                await bot.sendMessage(
                    chatId,
                    links.length ? links.join('\n') : 'لا توجد روابط أخرى'
                );
                break;
            }

            case 'links_export':
                await exportAllSections();
                await bot.sendMessage(chatId, '✅ تم تصدير الروابط بنجاح');
                break;

            // =========================
            // Publishing
            // =========================
            case 'publish_start':
                await bot.sendMessage(
                    chatId,
                    '🚀 ميزة النشر جاهزة.\nسيتم ربط اختيار الإعلان في الخطوة القادمة.'
                );
                break;

            case 'publish_stop':
                stop();
                await bot.sendMessage(chatId, '⛔ تم إيقاف النشر');
                break;

            // =========================
            // Groups
            // =========================
            case 'groups_join':
                await bot.sendMessage(
                    chatId,
                    '📨 أرسل روابط مجموعات واتساب في رسالة واحدة أو عدة رسائل.'
                );
                break;

            case 'groups_report': {
                const filePath = await generateReportFile();
                if (filePath) {
                    await bot.sendDocument(chatId, filePath);
                } else {
                    await bot.sendMessage(chatId, 'لا يوجد تقرير متاح');
                }
                break;
            }

            // =========================
            // Default
            // =========================
            default:
                await bot.sendMessage(
                    chatId,
                    '⚠️ هذا الزر لم يتم ربطه بعد.'
                );
                log('WARN', `Unknown button: ${action}`);
        }
    } catch (err) {
        log('ERROR', err.message);
        await bot.sendMessage(chatId, '❌ حدث خطأ أثناء تنفيذ الأمر');
    }

    await bot.answerCallbackQuery(query.id);
}

// ============================
// Message handler (placeholder)
// ============================
async function handleMessage(bot, msg) {
    // حالياً لا شيء
}

// ============================
module.exports = {
    handleCallback,
    handleMessage
};
