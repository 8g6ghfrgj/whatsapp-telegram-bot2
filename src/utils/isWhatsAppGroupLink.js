function isWhatsAppGroupLink(link) {
  return /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(link);
}

module.exports = isWhatsAppGroupLink;
