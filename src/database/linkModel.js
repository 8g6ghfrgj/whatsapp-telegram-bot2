/**
 * src/database/linkModel.js
 * Link Persistence Layer
 *
 * مسؤول عن:
 * - حفظ الروابط في قاعدة البيانات
 * - منع التكرار نهائيًا
 * - جلب الروابط لاحقًا للتصدير والعرض
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const db = require('./db');
const { getLinks } = require('../collectors/linkCollector');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [LINK_MODEL:${level}] ${message}`);
}

// ============================
// حفظ رابط واحد
// ============================
function saveLink(url, type, source = 'whatsapp') {
    return new Promise((resolve) => {
        const stmt = `
            INSERT OR IGNORE INTO links (url, type, source, created_at)
            VALUES (?, ?, ?, ?)
        `;

        db.run(
            stmt,
            [url, type, source, Date.now()],
            function () {
                if (this.changes > 0) {
                    log('SAVED', `${type} link saved`);
                }
                resolve();
            }
        );
    });
}

// ============================
// حفظ كل الروابط المجمعة
// ============================
async function flushLinksToDB() {
    try {
        const links = getLinks();

        for (const url of links.whatsapp) {
            await saveLink(url, 'whatsapp');
        }

        for (const url of links.telegram) {
            await saveLink(url, 'telegram');
        }

        for (const url of links.other) {
            await saveLink(url, 'other');
        }

        log('INFO', 'All collected links flushed to database');
    } catch (err) {
        log('ERROR', `Failed to flush links: ${err.message}`);
    }
}

// ============================
// جلب الروابط حسب النوع
// ============================
function getLinksByType(type) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT url FROM links WHERE type = ? ORDER BY id ASC`,
            [type],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map((r) => r.url));
                }
            }
        );
    });
}

// ============================
// جلب كل الروابط
// ============================
function getAllLinks() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT url, type FROM links ORDER BY id ASC`,
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

// ============================
// تنظيف الروابط (اختياري لاحقًا)
// ============================
function clearAllLinks() {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM links`, [], (err) => {
            if (err) reject(err);
            else {
                log('INFO', 'All links cleared from database');
                resolve();
            }
        });
    });
}

// ============================
// تشغيل دوري تلقائي (Flush Engine)
// ============================
let flushInterval = setInterval(() => {
    flushLinksToDB();
}, 60 * 1000); // كل دقيقة

// ============================
// التصدير
// ============================
module.exports = {
    flushLinksToDB,
    getLinksByType,
    getAllLinks,
    clearAllLinks
};
