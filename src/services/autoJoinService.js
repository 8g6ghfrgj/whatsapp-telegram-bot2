/**
 * Auto Join Service
 * Join WhatsApp groups with 2 minutes delay
 */

const activeJoinQueues = new Map(); 
// telegramId => { queue: [], running: boolean }

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractWhatsAppLinks(text) {
  if (!text) return [];
  const regex = /(https?:\/\/chat\.whatsapp\.com\/[^\s]+)/g;
  return text.match(regex) || [];
}

async function startJoinQueue({ bot, chatId, telegramId, waClient, text }) {
  const links = extractWhatsAppLinks(text);

  if (!links.length) {
    return bot.sendMessage(chatId, '❌ لم يتم العثور على روابط واتساب');
  }

  if (activeJoinQueues.has(telegramId)) {
    return bot.sendMessage(chatId, '⚠️ هناك عملية انضمام تعمل بالفعل');
  }

  activeJoinQueues.set(telegramId, {
    queue: [...links],
    running: true
  });

  await bot.sendMessage(
    chatId,
    `🚀 تم بدء الانضمام\n📎 عدد الروابط: ${links.length}\n⏱️ كل رابط بعد 2 دقيقة`
  );

  while (activeJoinQueues.get(telegramId)?.running) {
    const job = activeJoinQueues.get(telegramId);
    if (!job.queue.length) break;

    const link = job.queue.shift();

    try {
      const inviteCode = link.split('/').pop();
      await waClient.acceptInvite(inviteCode);

      await bot.sendMessage(chatId, `✅ تم الانضمام:\n${link}`);
    } catch (err) {
      // طلب انضمام أو فشل
      await bot.sendMessage(
        chatId,
        `⚠️ لم يتم الانضمام مباشرة (قد يكون طلب انضمام):\n${link}`
      );
    }

    await delay(2 * 60 * 1000); // 2 دقائق
  }

  activeJoinQueues.delete(telegramId);
  await bot.sendMessage(chatId, '🏁 انتهت عملية الانضمام');
}

module.exports = {
  startJoinQueue
};
