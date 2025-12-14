const express = require('express');

/**
 * Starts Express Server
 * @param {number} port
 */
function startServer(port) {
  return new Promise((resolve, reject) => {
    try {
      const app = express();

      // Middlewares
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      // Root endpoint
      app.get('/', (req, res) => {
        res.status(200).json({
          status: 'ok',
          message: 'Server is running successfully',
          stage: 'Stage 1 - Base Server',
          timestamp: new Date().toISOString()
        });
      });

      // Health check (Render uses this)
      app.get('/health', (req, res) => {
        res.status(200).json({
          status: 'healthy',
          uptime: process.uptime(),
          memory: {
            rss: process.memoryUsage().rss,
            heapTotal: process.memoryUsage().heapTotal,
            heapUsed: process.memoryUsage().heapUsed
          },
          nodeVersion: process.version,
          platform: process.platform
        });
      });

      // 404 handler
      app.use((req, res) => {
        res.status(404).json({
          status: 'error',
          message: 'Route not found'
        });
      });

      // Start server
      app.listen(port, () => {
        console.log(`✅ Server listening on port ${port}`);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  startServer
};
