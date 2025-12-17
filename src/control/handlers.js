/**
 * src/control/handlers.js
 * Telegram Button Handlers (Router)
 *
 * مسؤول عن:
 * - ربط أزرار تيليجرام بمحركات البوت
 * - التحكم بالعمليات (تصدير – نشر – تقارير – إيقاف)
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

// ============================
// استيراد المحركات
// ============================
const { exportAllSections } = require('../export/exportTxt');
const { startPublishing } = require('../publisher/autoPublish');
const { stop } = require('../publisher/stopPublish');
const { generateReportFile } = require('../reports/joinReport');
const { getLinksByType } = require('../database/linkModel');
const { processGroupLinks } = require('../groups/joinGroups');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [HANDLER:${level}] ${message}`);
}

// ============================
// معالج الأزرار
// ============================
async function handleCallback(bot, query) {
    const chatId = query.message.chat.id;
    const action = query.data;

    try {
        switch (action) {
            // ============================
            // تصدير الروابط
            // ============================
            case 'links_export':
                await exportAllSections();
                await bot.sendMessage(chatId, '✅ تم تصدير جميع الروابط');
                break;

            // ============================
            // عرض الروابط
            // ============================
            case 'links_whatsapp': {
                const links = await getLinksByType('whatsapp');
                await bot.sendMessage(
                    chatId,
                    links.length
                        ? links.join('\n')
                        : 'لا توجد روابط واتساب'
                );
                break;
            }

            case 'links_telegram': {
                const links = await getLinksByType('telegram');
                await bot.sendMessage(
                    chatId,
                    links.length
                        ? links.join('\n')
                        : 'لا توجد روابط تيليجرام'
                );
                break;
            }

            case 'links_other': {
                const links = await getLinksByType('other');
                await bot.sendMessage(
                    chatId,
                    links.length
                        ? links.join('\n')
                        : 'لا توجد روابط أخرى'
                );
                break;
            }

            // ============================
            // النشر
            // ============================
            case 'publish_start':
                await bot.sendMessage(
                    chatId,
                    '⚠️ بدء النشر سيتم ربطه باختيار الإعلان (الخطوة القادمة)'
                );
                break;

            case 'publish_stop':
                stop();
                await bot.sendMessage(chatId, '⛔ تم إيقاف النشر');
                break;

            // ============================
            // الانضمام للمجموعات
            // ============================
            case 'groups_join':
                await bot.sendMessage(
                    chatId,
                    '📨 أرسل روابط مجموعات واتساب في رسالة واحدة أو عدة رسائل'
                );
                break;

            // ============================
            // تقرير الانضمام
            // ============================
            case 'groups_report': {
                const filePath = await generateReportFile();
                if (filePath) {
                    await bot.sendDocument(chatId, filePath);
                } else {
                    await bot.sendMessage(chatId, 'لا يوجد تقرير متاح');
                }
                break;
            }

            default:
                await bot.sendMessage(chatId, '⚠️ زر غير معروف');
        }
    } catch (err) {
        log('ERROR', err.message);
        await bot.sendMessage(chatId, '❌ حدث خطأ أثناء تنفيذ الأمر');
    }

    await bot.answerCallbackQuery(query.id);
}

// ============================
// معالج الرسائل النصية (للانضمام للمجموعات)
// ============================
async function handleMessage(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // محاولة استخراج روابط مجموعات واتساب
    const links =
        text.match(/https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/gi) ||
        [];

    if (links.length > 0) {
        await bot.sendMessage(
            chatId,
            `⏳ جاري معالجة ${links.length} رابط مجموعة...`
        );
        await processGroupLinks(links);
        await bot.sendMessage(chatId, '✅ تم إرسال طلبات الانضمام');
    }
}

// ============================
// التصدير
// ============================
module.exports = {
    handleCallback,
    handleMessage
};
