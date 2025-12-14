/**
 * Telegram Menus
 * Main Inline Keyboard
 */

const mainMenu = {
  inline_keyboard: [
    [
      { text: '🔗 ربط الحساب', callback_data: 'add_account' },
      { text: '📱 عرض الحسابات المرتبطة', callback_data: 'list_accounts' }
    ],
    [
      { text: '📢 النشر التلقائي', callback_data: 'start_autopost' },
      { text: '⛔ إيقاف النشر التلقائي', callback_data: 'stop_autopost' }
    ],
    [
      { text: '👥 الانضمام لمجموعات واتساب', callback_data: 'join_groups' },
      { text: '📊 تقرير المجموعات', callback_data: 'groups_report' }
    ],
    [
      { text: '🔍 تجميع الروابط', callback_data: 'collect_links' },
      { text: '📂 عرض الروابط', callback_data: 'show_links' }
    ]
  ]
};

module.exports = {
  mainMenu
};
