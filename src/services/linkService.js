const links = {
  whatsapp: new Set(),
  telegram: new Set(),
  other: new Set()
};

function addLink(type, link) {
  if (!links[type]) return;
  links[type].add(link);
}

function getAll() {
  return {
    whatsapp: Array.from(links.whatsapp),
    telegram: Array.from(links.telegram),
    other: Array.from(links.other)
  };
}

function clearAll() {
  links.whatsapp.clear();
  links.telegram.clear();
  links.other.clear();
}

module.exports = {
  addLink,
  getAll,
  clearAll
};
