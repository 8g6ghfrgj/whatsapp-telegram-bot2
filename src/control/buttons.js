/**
 * src/control/buttons.js
 * Telegram Buttons Definitions
 *
 * مسؤول عن:
 * - تعريف جميع أزرار التحكم
 * - تنظيم القوائم
 * - عدم احتواء أي منطق تنفيذي
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

// ============================
// القائمة الرئيسية
// ============================
function mainMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔗 ربط حساب واتساب', callback_data: 'wa_link' }
                ],
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
// قائمة النشر (مستقبلية)
// ============================
function publishMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📝 إعلان نصي', callback_data: 'ad_text' },
                    { text: '🖼️ صورة', callback_data: 'ad_image' }
                ],
                [
                    { text: '🎥 فيديو', callback_data: 'ad_video' },
                    { text: '👤 جهة اتصال', callback_data: 'ad_contact' }
                ],
                [
                    { text: '🔙 رجوع', callback_data: 'back_main' }
                ]
            ]
        }
    };
}

// ============================
// قائمة الروابط
// ============================
function linksMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📱 واتساب', callback_data: 'links_whatsapp' },
                    { text: '✈️ تيليجرام', callback_data: 'links_telegram' }
                ],
                [
                    { text: '🌐 أخرى', callback_data: 'links_other' }
                ],
                [
                    { text: '🔙 رجوع', callback_data: 'back_main' }
                ]
            ]
        }
    };
}

// ============================
// التصدير
// ============================
module.exports = {
    mainMenu,
    publishMenu,
    linksMenu
};
