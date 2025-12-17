/**
 * src/whatsapp/connectionGuard.js
 * Connection Guard & Recovery Layer
 *
 * مسؤول عن:
 * - مراقبة حالة الاتصال
 * - إعادة الاتصال التلقائي
 * - اكتشاف تسجيل الخروج
 * - منع تكرار ربط الأحداث
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const { getSocket, init } = require('./connect');
const { DisconnectReason } = require('@whiskeysockets/baileys');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [GUARD:${level}] ${message}`);
}

// ============================
// حالة الحارس
// ============================
let guardInitialized = false;
let socketBound = false;
let monitorInterval = null;

// ============================
// ربط الحارس بالاتصال
// ============================
function bindGuard(sock) {
    if (!sock || socketBound) return;

    socketBound = true;
    guardInitialized = true;

    log('INFO', 'Binding connection guard to WhatsApp socket');

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            log('READY', 'Connection is stable');
            return;
        }

        if (connection === 'close') {
            const statusCode =
                lastDisconnect?.error?.output?.statusCode;

            if (statusCode === DisconnectReason.loggedOut) {
                log(
                    'ERROR',
                    'Logged out from WhatsApp. Manual re-link required.'
                );
                socketBound = false;
                return;
            }

            log('WARN', 'Connection lost. Attempting safe reconnect...');
            socketBound = false;

            // إعادة الاتصال الآمنة
            try {
                await delay(3000);
                await init();
            } catch (err) {
                log('ERROR', 'Reconnect attempt failed');
            }
        }
    });

    log('INFO', 'Connection guard active');
}

// ============================
// مراقبة جاهزية الاتصال
// ============================
function startMonitoring() {
    if (monitorInterval) return;

    monitorInterval = setInterval(() => {
        try {
            const sock = getSocket();

            if (sock && !guardInitialized) {
                bindGuard(sock);
            }
        } catch (err) {
            // صامت — لا نكسر النظام
        }
    }, 1000);
}

// ============================
// أدوات مساعدة
// ============================
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================
// تشغيل تلقائي
// ============================
startMonitoring();

// ============================
// التصدير (للاستخدام المستقبلي إن لزم)
// ============================
module.exports = {
    startMonitoring
};
