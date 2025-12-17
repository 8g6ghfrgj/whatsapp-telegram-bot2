/**
 * src/whatsapp/events.js
 * WhatsApp Events Listener
 *
 * مسؤول عن:
 * - استقبال جميع الرسائل (خاص + قروبات)
 * - توحيد شكل البيانات
 * - تمرير الرسائل للأنظمة القادمة لاحقًا
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const { getSocket } = require('./connect');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [EVENTS:${level}] ${message}`);
}

// ============================
// حالة التشغيل
// ============================
let initialized = false;

// ============================
// تهيئة مستمع الأحداث
// ============================
function initEvents() {
    const sock = getSocket();

    if (!sock) {
        log('WARN', 'WhatsApp socket not ready yet');
        return;
    }

    if (initialized) {
        log('WARN', 'Events already initialized');
        return;
    }

    initialized = true;
    log('INFO', 'Initializing WhatsApp event listeners');

    // ============================
    // استقبال الرسائل
    // ============================
    sock.ev.on('messages.upsert', async (data) => {
        try {
            if (!data.messages || !Array.isArray(data.messages)) return;

            for (const msg of data.messages) {
                if (!msg.message) continue;

                const isGroup = msg.key.remoteJid.endsWith('@g.us');
                const senderJid = isGroup
                    ? msg.key.participant
                    : msg.key.remoteJid;

                const messageId = msg.key.id;
                const chatId = msg.key.remoteJid;
                const fromMe = msg.key.fromMe;
                const timestamp = msg.messageTimestamp
                    ? Number(msg.messageTimestamp) * 1000
                    : Date.now();

                // ============================
                // استخراج النص
                // ============================
                let text = '';

                if (msg.message.conversation) {
                    text = msg.message.conversation;
                } else if (msg.message.extendedTextMessage?.text) {
                    text = msg.message.extendedTextMessage.text;
                } else if (msg.message.imageMessage?.caption) {
                    text = msg.message.imageMessage.caption;
                } else if (msg.message.videoMessage?.caption) {
                    text = msg.message.videoMessage.caption;
                }

                // ============================
                // كائن الرسالة الموحد
                // ============================
                const messageObject = {
                    messageId,
                    chatId,
                    senderJid,
                    isGroup,
                    fromMe,
                    text,
                    timestamp,
                    raw: msg
                };

                // ============================
                // تسجيل فقط (بدون رد)
                // ============================
                log(
                    'MESSAGE',
                    `Received ${isGroup ? 'GROUP' : 'PRIVATE'} message`
                );

                // ============================
                // نقطة تمرير للأنظمة القادمة
                // (Collectors / Replies / Publisher)
                // ============================
                // سيتم ربطها لاحقًا بدون تعديل هذا الملف
            }
        } catch (error) {
            log('ERROR', `Message handling failed: ${error.message}`);
        }
    });

    // ============================
    // تحديثات الحالة (اختياري)
    // ============================
    sock.ev.on('presence.update', () => {
        // متروك للاستخدام المستقبلي
    });

    log('READY', 'WhatsApp events listener is active');
}

// ============================
// التصدير
// ============================
module.exports = {
    initEvents
};
