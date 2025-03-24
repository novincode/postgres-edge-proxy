/**
 * Entry point for the Edge Proxy application
 * @module index
 */
import { createServer } from './server';
import { logger } from './utils/logger';
import { env } from './config/env';

const port = parseInt(env.PORT || '3001');

async function startServer() {
  try {
    const app = await createServer();
    app.listen(port, () => {
      logger.info(`Edge Proxy server running at http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
