/**
 * src/collectors/linkCollector.js
 * Link Collector Engine (Read-Only)
 *
 * مسؤول عن:
 * - استخراج الروابط من جميع الرسائل
 * - تصنيف الروابط
 * - منع التكرار (In-Memory)
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
    console.log(`[${time}] [COLLECTOR:${level}] ${message}`);
}

// ============================
// مخازن الروابط (In-Memory)
// ============================
const linksStore = {
    whatsapp: new Set(),
    telegram: new Set(),
    other: new Set()
};

// ============================
// Regex للروابط
// ============================
const REGEX = {
    whatsapp: /(https?:\/\/)?(chat\.whatsapp\.com\/[A-Za-z0-9_-]+)/gi,
    telegram: /(https?:\/\/)?(t\.me\/[A-Za-z0-9_\/-]+)/gi,
    general: /(https?:\/\/[^\s]+)/gi
};

// ============================
// حالة التشغيل
// ============================
let initialized = false;

// ============================
// استخراج وتصنيف الروابط
// ============================
function extractLinks(text = '') {
    if (!text) return;

    let match;

    // روابط واتساب
    while ((match = REGEX.whatsapp.exec(text)) !== null) {
        const link = match[0];
        if (!linksStore.whatsapp.has(link)) {
            linksStore.whatsapp.add(link);
            log('NEW', `WhatsApp link collected`);
        }
    }

    // روابط تيليجرام
    while ((match = REGEX.telegram.exec(text)) !== null) {
        const link = match[0];
        if (!linksStore.telegram.has(link)) {
            linksStore.telegram.add(link);
            log('NEW', `Telegram link collected`);
        }
    }

    // روابط عامة
    while ((match = REGEX.general.exec(text)) !== null) {
        const link = match[0];

        // منع تكرار الروابط المصنفة سابقًا
        if (
            linksStore.whatsapp.has(link) ||
            linksStore.telegram.has(link)
        ) {
            continue;
        }

        if (!linksStore.other.has(link)) {
            linksStore.other.add(link);
            log('NEW', `Other link collected`);
        }
    }
}

// ============================
// ربط المستمع
// ============================
function bindCollector(sock) {
    if (!sock || initialized) return;

    initialized = true;
    log('INFO', 'Initializing link collector');

    sock.ev.on('messages.upsert', async (data) => {
        try {
            if (!data.messages) return;

            for (const msg of data.messages) {
                if (!msg.message) continue;

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

                if (text) {
                    extractLinks(text);
                }
            }
        } catch (err) {
            log('ERROR', `Link extraction failed: ${err.message}`);
        }
    });

    log('READY', 'Link collector active');
}

// ============================
// مراقبة جاهزية الاتصال
// ============================
function startCollector() {
    const interval = setInterval(() => {
        try {
            const sock = getSocket();
            if (sock) {
                bindCollector(sock);
                clearInterval(interval);
            }
        } catch (_) {
            // صامت
        }
    }, 1000);
}

// ============================
// واجهات الوصول (للمراحل القادمة)
// ============================
function getLinks() {
    return {
        whatsapp: Array.from(linksStore.whatsapp),
        telegram: Array.from(linksStore.telegram),
        other: Array.from(linksStore.other)
    };
}

function clearLinks() {
    linksStore.whatsapp.clear();
    linksStore.telegram.clear();
    linksStore.other.clear();
    log('INFO', 'All collected links cleared');
}

// ============================
// تشغيل تلقائي
// ============================
startCollector();

// ============================
// التصدير
// ============================
module.exports = {
    getLinks,
    clearLinks
};
