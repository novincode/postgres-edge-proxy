/**
 * Entry point for the Edge Proxy application
 * @module index
 */
// Load environment variables first before anything else

import { createServer } from './server'; 
import { logger } from './utils/logger';
import { env } from './config/env';

const port = parseInt(env.PORT);

async function startServer() {
  try {
    // Database URL is already logged in env.ts
    
    const app = createServer();
    app.listen(port, () => {
      logger.info(`Edge Proxy server running at http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
