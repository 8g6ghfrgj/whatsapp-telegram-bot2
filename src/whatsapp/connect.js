/**
 * src/whatsapp/connect.js
 * WhatsApp Connection Module (Multi-Device)
 * مسؤول عن:
 * - إنشاء اتصال واتساب
 * - توليد QR
 * - حفظ الجلسة
 * - إعادة الاتصال التلقائي
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

// ============================
// مسار الجلسات
// ============================
const SESSIONS_DIR = path.join(__dirname, 'sessions');

if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [WHATSAPP:${level}] ${message}`);
}

// ============================
// متغير الاتصال
// ============================
let sock = null;

// ============================
// تهيئة واتساب
// ============================
async function init() {
    try {
        log('INFO', 'Initializing WhatsApp connection');

        const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            auth: state,
            version,
            printQRInTerminal: true,
            browser: ['Chrome', 'Windows', '10'],
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false
        });

        // ============================
        // حفظ بيانات الجلسة
        // ============================
        sock.ev.on('creds.update', saveCreds);

        // ============================
        // مراقبة الاتصال
        // ============================
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                log('QR', 'QR code generated, scan it using your main WhatsApp device');
            }

            if (connection === 'open') {
                log('READY', 'WhatsApp connected successfully as linked device');
            }

            if (connection === 'close') {
                const reason =
                    lastDisconnect?.error?.output?.statusCode;

                if (reason === DisconnectReason.loggedOut) {
                    log('ERROR', 'Logged out from WhatsApp. Session invalid.');
                } else {
                    log('WARN', 'Connection closed, attempting to reconnect');
                    init();
                }
            }
        });

        return sock;

    } catch (error) {
        log('ERROR', `Failed to initialize WhatsApp: ${error.message}`);
        throw error;
    }
}

// ============================
// الحصول على الاتصال الحالي
// ============================
function getSocket() {
    return sock;
}

// ============================
// تسجيل الخروج (مستقبلاً)
// ============================
async function logout() {
    if (!sock) return;
    try {
        await sock.logout();
        log('INFO', 'Logged out successfully');
    } catch (error) {
        log('ERROR', 'Logout failed');
    }
}

// ============================
// التصدير
// ============================
module.exports = {
    init,
    getSocket,
    logout
};
