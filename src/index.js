/**
 * index.js
 * Main Entry Point (Final)
 *
 * هذا الملف هو نقطة التشغيل الوحيدة للمشروع
 * يقوم بتحميل وتشغيل جميع الوحدات مرة واحدة
 * لا يتم تعديله بعد اعتماده
 */

'use strict';

// ============================
// تحميل متغيرات البيئة
// ============================
require('dotenv').config();

// ============================
// Logger مركزي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [CORE:${level}] ${message}`);
}

// ============================
// حماية من الأخطاء القاتلة
// ============================
process.on('uncaughtException', (err) => {
    log('FATAL', err.stack || err.message);
});

process.on('unhandledRejection', (reason) => {
    log('FATAL', reason);
});

// ============================
// تشغيل النواة
// ============================
async function bootstrap() {
    log('INFO', 'Starting WhatsApp Multi-Device Automation Bot');

    // ============================
    // 1️⃣ قاعدة البيانات
    // ============================
    require('./src/database/db');
    require('./src/database/linkModel');

    // ============================
    // 2️⃣ واتساب (اتصال + أحداث + حماية)
    // ============================
    const whatsapp = require('./src/whatsapp/connect');
    await whatsapp.init();

    require('./src/whatsapp/events');
    require('./src/whatsapp/connectionGuard');

    // ============================
    // 3️⃣ الجامع والردود
    // ============================
    require('./src/collectors/linkCollector');
    require('./src/replies/autoReply');

    // ============================
    // 4️⃣ المجموعات والتقارير
    // ============================
    const groups = require('./src/groups/joinGroups');
    groups.monitorPendingRequests();

    require('./src/reports/joinReport');

    // ============================
    // 5️⃣ لوحة تحكم تيليجرام
    // ============================
    require('./src/control/telegramBot');

    log('READY', 'All systems initialized successfully');
}

// ============================
// بدء التشغيل
// ============================
bootstrap();
