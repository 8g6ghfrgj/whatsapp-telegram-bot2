const { Client, LocalAuth } = require('whatsapp-web.js');

const clients = new Map();

function createClient(sessionId) {
  if (clients.has(sessionId)) {
    return clients.get(sessionId);
  }

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: sessionId,
      dataPath: 'sessions'
    }),
    puppeteer: {
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    }
  });

  clients.set(sessionId, client);
  return client;
}

function getClient(sessionId) {
  return clients.get(sessionId);
}

function removeClient(sessionId) {
  const client = clients.get(sessionId);
  if (client) {
    client.destroy();
    clients.delete(sessionId);
  }
}

module.exports = {
  createClient,
  getClient,
  removeClient
};
