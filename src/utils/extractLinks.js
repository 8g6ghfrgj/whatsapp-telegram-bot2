const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function extractLinks(text = '') {
  return text.match(URL_REGEX) || [];
}

function classifyLink(link) {
  if (link.includes('chat.whatsapp.com')) return 'whatsapp';
  if (link.includes('t.me')) return 'telegram';
  return 'other';
}

module.exports = {
  extractLinks,
  classifyLink
};
