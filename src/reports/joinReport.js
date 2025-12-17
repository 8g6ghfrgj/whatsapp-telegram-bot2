/**
 * src/reports/joinReport.js
 * Groups Join Report Engine
 *
 * مسؤول عن:
 * - إنشاء تقرير شامل عن حالة الانضمام للمجموعات
 * - فرز المجموعات حسب الحالة
 * - إخراج تقرير نصي منسق
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const db = require('../database/db');
const fs = require('fs');
const path = require('path');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [REPORT:${level}] ${message}`);
}

// ============================
// مسار التقارير
// ============================
const REPORT_DIR = path.join(__dirname, 'files');

if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// ============================
// إعدادات الزمن
// ============================
const REQUEST_TIMEOUT = 24 * 60 * 60 * 1000; // 24 ساعة

// ============================
// جلب كل بيانات المجموعات
// ============================
function fetchGroups() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM groups ORDER BY id ASC`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

// ============================
// إنشاء التقرير النصي
// ============================
function buildReport(groups = []) {
    const now = Date.now();

    const joined = [];
    const pending = [];
    const timeout = [];

    for (const g of groups) {
        if (g.status === 'joined') {
            joined.push(g);
        } else {
            if (now - g.joined_at >= REQUEST_TIMEOUT) {
                timeout.push(g);
            } else {
                pending.push(g);
            }
        }
    }

    const lines = [];

    lines.push('===== WhatsApp Groups Join Report =====');
    lines.push(`Generated at: ${new Date().toISOString()}`);
    lines.push('');

    lines.push(`--- Joined Groups (${joined.length}) ---`);
    joined.forEach((g, i) => {
        lines.push(`${i + 1}. ${g.group_jid}`);
    });

    lines.push('');
    lines.push(`--- Pending Approval (${pending.length}) ---`);
    pending.forEach((g, i) => {
        lines.push(`${i + 1}. ${g.group_jid}`);
    });

    lines.push('');
    lines.push(`--- Not Approved (24h Passed) (${timeout.length}) ---`);
    timeout.forEach((g, i) => {
        lines.push(`${i + 1}. ${g.group_jid}`);
    });

    lines.push('');
    lines.push('===== End of Report =====');

    return lines.join('\n');
}

// ============================
// حفظ التقرير في ملف
// ============================
async function generateReportFile() {
    try {
        const groups = await fetchGroups();
        const reportContent = buildReport(groups);

        const filename = `join_report_${Date.now()}.txt`;
        const filePath = path.join(REPORT_DIR, filename);

        fs.writeFileSync(filePath, reportContent, 'utf8');

        log('DONE', `Join report generated`);
        return filePath;
    } catch (err) {
        log('ERROR', `Failed to generate report: ${err.message}`);
        return null;
    }
}

// ============================
// تصدير الواجهات
// ============================
module.exports = {
    generateReportFile
};
