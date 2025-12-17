/**
 * index.js
 * Core Entry Point
 * هذا الملف هو نقطة التشغيل الأساسية للبوت
 * لا يتم تعديله بعد اعتماده
 */

'use strict';

// ============================
// تحميل المتغيرات البيئية
// ============================
require('dotenv').config();

// ============================
// معلومات التطبيق
// ============================
const APP_INFO = {
    name: 'WhatsApp Multi-Device Bot',
    version: '1.0.0',
    startedAt: new Date()
};

// ============================
// Logger مركزي ثابت
// ============================
function logger(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

// ============================
// حماية من أخطاء النظام
// ============================
process.on('uncaughtException', (error) => {
    logger('FATAL', `Uncaught Exception: ${error.stack || error.message}`);
});

process.on('unhandledRejection', (reason) => {
    logger('FATAL', `Unhandled Rejection: ${reason}`);
});

// ============================
// تشغيل النواة
// ============================
async function startCore() {
    logger('INFO', `${APP_INFO.name} v${APP_INFO.version} initializing`);
    logger('INFO', `Boot time: ${APP_INFO.startedAt.toISOString()}`);

    // ============================
    // تحميل وحدة واتساب (عند توفرها)
    // ============================
    try {
        const whatsappModule = require('./src/whatsapp/connect');

        if (whatsappModule && typeof whatsappModule.init === 'function') {
            await whatsappModule.init();
            logger('INFO', 'WhatsApp module initialized successfully');
        } else {
            logger('WARN', 'WhatsApp module loaded but init() not available');
        }
    } catch (error) {
        logger(
            'WARN',
            'WhatsApp module not available yet (expected in early stages)'
        );
    }

    // ============================
    // جاهزية النظام
    // ============================
    logger('READY', 'Core system is running');
}

// ============================
// بدء التنفيذ
// ============================
startCore();
