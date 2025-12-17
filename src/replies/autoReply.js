/**
 * src/replies/autoReply.js
 * Auto Reply Engine
 *
 * مسؤول عن:
 * - الرد التلقائي على الرسائل الخاصة
 * - الرد التلقائي داخل القروبات
 * - تأخير بشري لتقليل الحظر
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const { getSocket } = require('../whatsapp/connect');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [REPLY:${level}] ${message}`);
}

// ============================
// إعدادات الرد
// ============================
const PRIVATE_REPLY_TEXT =
    'مرحبًا 👋\nتم استلام رسالتك وسيتم الرد عليك في أقرب وقت.';

const GROUP_REPLY_TEXT =
    'تم استلام رسالتك، شكرًا لتواصلك.';

// ============================
// إعدادات التأخير
// ============================
const MIN_DELAY = 4000;
const MAX_DELAY = 9000;

function randomDelay() {
    return (
        Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) +
        MIN_DELAY
    );
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================
// حالة التشغيل
// ============================
let initialized = false;

// ============================
// تهيئة الردود
// ============================
function bindAutoReply(sock) {
    if (!sock || initialized) return;

    initialized = true;
    log('INFO', 'Initializing auto-reply engine');

    sock.ev.on('messages.upsert', async (data) => {
        try {
            if (!data.messages) return;

            for (const msg of data.messages) {
                if (!msg.message) continue;
                if (msg.key.fromMe) continue; // تجاهل رسائلنا

                const chatId = msg.key.remoteJid;
                const isGroup = chatId.endsWith('@g.us');

                await delay(randomDelay());

                if (isGroup) {
                    await sock.sendMessage(chatId, {
                        text: GROUP_REPLY_TEXT
                    });
                    log('GROUP', `Auto reply sent to group`);
                } else {
                    await sock.sendMessage(chatId, {
                        text: PRIVATE_REPLY_TEXT
                    });
                    log('PRIVATE', `Auto reply sent to private chat`);
                }
            }
        } catch (err) {
            log('ERROR', `Auto-reply failed: ${err.message}`);
        }
    });

    log('READY', 'Auto-reply engine active');
}

// ============================
// مراقبة جاهزية الاتصال
// ============================
function startAutoReply() {
    const interval = setInterval(() => {
        try {
            const sock = getSocket();
            if (sock) {
                bindAutoReply(sock);
                clearInterval(interval);
            }
        } catch (_) {
            // صامت
        }
    }, 1000);
}

// ============================
// تشغيل تلقائي
// ============================
startAutoReply();

// ============================
// التصدير (للمستقبل إن لزم)
// ============================
module.exports = {};
