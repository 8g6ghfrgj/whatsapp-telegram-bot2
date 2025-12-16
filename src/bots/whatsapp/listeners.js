const collector = require('./collector');
const replyService = require('../../services/replyService');

function registerWhatsAppListeners(client) {
  client.on('message', async (message) => {
    // تجميع الروابط
    collector.handleMessage(message);

    const replies = replyService.getReplies();

    // رد الخاص
    if (!message.isGroup && replies.private.enabled && replies.private.text) {
      try {
        await message.reply(replies.private.text);
      } catch (e) {
        console.error('Private reply error:', e.message);
      }
    }

    // رد القروبات
    if (message.isGroup && replies.group.enabled && replies.group.text) {
      try {
        await message.reply(replies.group.text);
      } catch (e) {
        console.error('Group reply error:', e.message);
      }
    }
  });
}

module.exports = {
  registerWhatsAppListeners
};
