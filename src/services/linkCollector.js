/**
 * Link Collector Service
 */

const { CollectedLink } = require('../models');

function detectLinkType(url) {
  if (url.includes('chat.whatsapp.com')) return 'whatsapp';
  if (url.includes('t.me') || url.includes('telegram.me')) return 'telegram';
  return 'website';
}

async function collectLinksFromMessage(sessionId, messageText) {
  if (!messageText) return;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = messageText.match(urlRegex) || [];

  for (const url of links) {
    const type = detectLinkType(url);

    await CollectedLink.create({
      sessionId,
      url,
      type
    });
  }
}

module.exports = {
  collectLinksFromMessage
};
