/**
 * src/publisher/autoPublish.js
 * Auto Publish Engine
 *
 * مسؤول عن:
 * - النشر التلقائي في جميع القروبات
 * - دعم أنواع إعلانات متعددة
 * - تأخير ذكي لتقليل الحظر
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { getSocket } = require('../whatsapp/connect');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [PUBLISH:${level}] ${message}`);
}

// ============================
// حالة النشر
// ============================
let publishing = false;
let publishQueue = [];
let currentIndex = 0;

// ============================
// إعدادات التأخير
// ============================
const MIN_DELAY = 3000; // 3 ثواني
const MAX_DELAY = 7000; // 7 ثواني

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
// جلب جميع القروبات
// ============================
async function getAllGroups(sock) {
    const chats = await sock.groupFetchAllParticipating();
    return Object.keys(chats);
}

// ============================
// إرسال الإعلان
// ============================
async function sendAd(sock, groupJid, ad) {
    try {
        if (ad.type === 'text') {
            await sock.sendMessage(groupJid, { text: ad.text });
        }

        if (ad.type === 'image') {
            await sock.sendMessage(groupJid, {
                image: fs.readFileSync(ad.path),
                caption: ad.caption || ''
            });
        }

        if (ad.type === 'video') {
            await sock.sendMessage(groupJid, {
                video: fs.readFileSync(ad.path),
                caption: ad.caption || ''
            });
        }

        if (ad.type === 'contact') {
            await sock.sendMessage(groupJid, {
                contacts: {
                    displayName: ad.name,
                    contacts: [{ vcard: ad.vcard }]
                }
            });
        }

        log('SENT', `Ad sent to ${groupJid}`);
    } catch (err) {
        log('ERROR', `Failed to send ad to ${groupJid}`);
    }
}

// ============================
// بدء النشر
// ============================
async function startPublishing(ad) {
    if (publishing) {
        log('WARN', 'Publishing already in progress');
        return;
    }

    const sock = getSocket();
    if (!sock) {
        log('ERROR', 'WhatsApp not connected');
        return;
    }

    publishing = true;
    currentIndex = 0;

    try {
        publishQueue = await getAllGroups(sock);
        log('INFO', `Starting publish to ${publishQueue.length} groups`);

        for (; currentIndex < publishQueue.length; currentIndex++) {
            if (!publishing) break;

            const groupJid = publishQueue[currentIndex];
            await sendAd(sock, groupJid, ad);
            await delay(randomDelay());
        }

        log('DONE', 'Publishing completed');
    } catch (err) {
        log('ERROR', `Publishing failed: ${err.message}`);
    } finally {
        publishing = false;
    }
}

// ============================
// إيقاف النشر
// ============================
function stopPublishing() {
    if (!publishing) {
        log('INFO', 'Publishing not active');
        return;
    }

    publishing = false;
    log('STOP', 'Publishing stopped by user');
}

// ============================
// حالة النشر
// ============================
function isPublishing() {
    return publishing;
}

// ============================
// التصدير
// ============================
module.exports = {
    startPublishing,
    stopPublishing,
    isPublishing
};
