/**
 * src/groups/joinGroups.js
 * WhatsApp Groups Join Engine
 *
 * مسؤول عن:
 * - التعرف على روابط مجموعات واتساب
 * - الانضمام التلقائي أو إرسال طلب انضمام
 * - تأخير 2 دقيقة بين كل رابط
 * - متابعة الطلبات لمدة 24 ساعة
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const { getSocket } = require('../whatsapp/connect');
const db = require('../database/db');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [GROUPS:${level}] ${message}`);
}

// ============================
// Regex روابط مجموعات واتساب
// ============================
const WHATSAPP_GROUP_REGEX =
    /(https?:\/\/)?chat\.whatsapp\.com\/[A-Za-z0-9_-]+/gi;

// ============================
// إعدادات الزمن
// ============================
const JOIN_DELAY = 2 * 60 * 1000; // 2 دقيقة
const REQUEST_TIMEOUT = 24 * 60 * 60 * 1000; // 24 ساعة

// ============================
// أدوات مساعدة
// ============================
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================
// استخراج روابط المجموعات
// ============================
function extractGroupLinks(text = '') {
    return text.match(WHATSAPP_GROUP_REGEX) || [];
}

// ============================
// حفظ حالة المجموعة
// ============================
function saveGroup(groupJid, name, status) {
    db.run(
        `
        INSERT OR IGNORE INTO groups (group_jid, name, joined_at, status)
        VALUES (?, ?, ?, ?)
    `,
        [groupJid, name || '', Date.now(), status]
    );
}

// ============================
// الانضمام إلى مجموعة
// ============================
async function joinGroup(sock, link) {
    try {
        const code = link.split('/').pop();
        const res = await sock.groupAcceptInvite(code);

        saveGroup(res, '', 'joined');
        log('JOINED', `Joined group ${res}`);
    } catch (err) {
        log('REQUEST', 'Join request sent or pending approval');
        // لا نملك JID الآن، سيتم تحديثه لاحقًا إن قُبل
    }
}

// ============================
// معالجة روابط الانضمام
// ============================
async function processGroupLinks(links = []) {
    const sock = getSocket();
    if (!sock) {
        log('ERROR', 'WhatsApp not connected');
        return;
    }

    for (const link of links) {
        await joinGroup(sock, link);
        await delay(JOIN_DELAY);
    }

    log('DONE', 'All group links processed');
}

// ============================
// مراقبة طلبات الانضمام (24 ساعة)
// ============================
function monitorPendingRequests() {
    setInterval(() => {
        const limitTime = Date.now() - REQUEST_TIMEOUT;

        db.all(
            `
            SELECT * FROM groups
            WHERE status = 'pending' AND joined_at < ?
        `,
            [limitTime],
            (err, rows) => {
                if (err || !rows.length) return;

                for (const row of rows) {
                    log(
                        'TIMEOUT',
                        `Group request not approved: ${row.group_jid}`
                    );
                }
            }
        );
    }, 60 * 60 * 1000); // كل ساعة
}

// ============================
// تصدير الواجهات
// ============================
module.exports = {
    extractGroupLinks,
    processGroupLinks,
    monitorPendingRequests
};
