const { Client, LocalAuth } = require('whatsapp-web.js');

let client = null;

function createClient() {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'main',
      dataPath: 'sessions'
    }),
    puppeteer: {
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote'
      ]
    }
  });

  return client;
}

function destroyClient() {
  if (!client) return;
  client.destroy();
  client = null;
}

module.exports = {
  createClient,
  destroyClient
};
