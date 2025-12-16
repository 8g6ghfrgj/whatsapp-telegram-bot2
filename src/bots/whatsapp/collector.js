const { extractLinks, classifyLink } = require('../../utils/extractLinks');
const linkService = require('../../services/linkService');

let collecting = false;

function startCollecting() {
  collecting = true;
}

function stopCollecting() {
  collecting = false;
}

function handleMessage(message) {
  if (!collecting) return;

  const text = message.body;
  if (!text) return;

  const links = extractLinks(text);
  for (const link of links) {
    const type = classifyLink(link);
    linkService.addLink(type, link);
  }
}

module.exports = {
  startCollecting,
  stopCollecting,
  handleMessage
};
