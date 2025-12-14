const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

class WhatsAppManager {
  constructor() {
    this.clients = new Map();
  }

  createClient(sessionId) {
    if (this.clients.has(sessionId)) {
      return this.clients.get(sessionId);
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: path.join(process.cwd(), 'sessions')
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      }
    });

    this.clients.set(sessionId, client);
    return client;
  }

  getClient(sessionId) {
    return this.clients.get(sessionId);
  }
}

module.exports = new WhatsAppManager();
