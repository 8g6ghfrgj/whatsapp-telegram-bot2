const fs = require('fs');
const path = require('path');
const linkService = require('./linkService');

function exportLinks() {
  const data = linkService.getAll();
  const exportDir = path.join(process.cwd(), 'exports');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const files = [];

  for (const type of Object.keys(data)) {
    const list = data[type];
    if (!list.length) continue;

    const filePath = path.join(exportDir, `${type}_links.txt`);
    fs.writeFileSync(filePath, list.join('\n'), 'utf8');

    files.push({ type, filePath });
  }

  return files;
}

module.exports = {
  exportLinks
};
