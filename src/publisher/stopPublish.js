/**
 * src/publisher/stopPublish.js
 * Stop Publishing Controller
 *
 * مسؤول عن:
 * - إيقاف النشر التلقائي فورًا
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const { stopPublishing, isPublishing } = require('./autoPublish');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [STOP_PUBLISH:${level}] ${message}`);
}

// ============================
// تنفيذ الإيقاف
// ============================
function stop() {
    if (!isPublishing()) {
        log('INFO', 'No active publishing process to stop');
        return;
    }

    stopPublishing();
    log('DONE', 'Publishing stopped successfully');
}

// ============================
// التصدير
// ============================
module.exports = {
    stop
};
