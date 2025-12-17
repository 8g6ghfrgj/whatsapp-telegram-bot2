/**
 * src/export/exportTxt.js
 * TXT Export Engine
 *
 * مسؤول عن:
 * - تصدير الروابط إلى ملفات TXT
 * - ملف مستقل لكل نوع روابط
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
    getLinksByType,
    getAllLinks
} = require('../database/linkModel');

// ============================
// مسار التصدير
// ============================
const EXPORT_DIR = path.join(__dirname, 'files');

if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [EXPORT:${level}] ${message}`);
}

// ============================
// كتابة ملف TXT
// ============================
function writeTxtFile(filename, lines = []) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(EXPORT_DIR, filename);
        const content = lines.join('\n');

        fs.writeFile(filePath, content, 'utf8', (err) => {
            if (err) reject(err);
            else resolve(filePath);
        });
    });
}

// ============================
// تصدير حسب النوع
// ============================
async function exportByType(type) {
    try {
        const links = await getLinksByType(type);

        if (!links || links.length === 0) {
            log('INFO', `No ${type} links to export`);
            return null;
        }

        const filename = `${type}_links.txt`;
        const filePath = await writeTxtFile(filename, links);

        log('DONE', `${type} links exported (${links.length})`);
        return filePath;
    } catch (err) {
        log('ERROR', `Export failed for ${type}: ${err.message}`);
        return null;
    }
}

// ============================
// تصدير جميع الروابط
// ============================
async function exportAll() {
    try {
        const allLinks = await getAllLinks();

        if (!allLinks || allLinks.length === 0) {
            log('INFO', 'No links to export');
            return null;
        }

        const lines = allLinks.map(
            (l) => `[${l.type.toUpperCase()}] ${l.url}`
        );

        const filename = `all_links.txt`;
        const filePath = await writeTxtFile(filename, lines);

        log('DONE', `All links exported (${lines.length})`);
        return filePath;
    } catch (err) {
        log('ERROR', `Export all failed: ${err.message}`);
        return null;
    }
}

// ============================
// واجهة التصدير
// ============================
async function exportAllSections() {
    await exportByType('whatsapp');
    await exportByType('telegram');
    await exportByType('other');
    await exportAll();
}

// ============================
// التصدير
// ============================
module.exports = {
    exportByType,
    exportAll,
    exportAllSections
};
