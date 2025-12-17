/**
 * src/database/db.js
 * Database Core (SQLite)
 *
 * مسؤول عن:
 * - إنشاء الاتصال بقاعدة البيانات
 * - تهيئة الجداول الأساسية
 * - توفير اتصال ثابت لبقية النظام
 *
 * هذا الملف لا يُعدل بعد اعتماده
 */

'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// ============================
// مسار قاعدة البيانات
// ============================
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');

// ============================
// Logger داخلي
// ============================
function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${time}] [DB:${level}] ${message}`);
}

// ============================
// إنشاء المجلد إن لم يكن موجودًا
// ============================
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// ============================
// الاتصال بقاعدة البيانات
// ============================
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        log('FATAL', `Failed to connect to database: ${err.message}`);
    } else {
        log('READY', 'Database connected successfully');
    }
});

// ============================
// تهيئة الجداول
// ============================
db.serialize(() => {
    // ============================
    // جدول الروابط
    // ============================
    db.run(`
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            type TEXT,
            source TEXT,
            created_at INTEGER
        )
    `);

    // ============================
    // جدول المجموعات
    // ============================
    db.run(`
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT UNIQUE,
            name TEXT,
            joined_at INTEGER,
            status TEXT
        )
    `);

    // ============================
    // جدول الإعلانات
    // ============================
    db.run(`
        CREATE TABLE IF NOT EXISTS ads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            content TEXT,
            created_at INTEGER
        )
    `);

    log('INFO', 'Database tables initialized');
});

// ============================
// إغلاق آمن
// ============================
process.on('exit', () => {
    db.close();
    log('INFO', 'Database connection closed');
});

// ============================
// التصدير
// ============================
module.exports = db;
