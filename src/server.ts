/**
 * Express server configuration
 * @module server
 */
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { proxyRouter } from './routes/proxy';
import { errorHandler } from './middleware/error-handler';
import { authenticateApiKey } from './middleware/auth';
import { initDatabase } from './config/database';

/**
 * Creates and configures an Express application
 * @returns {Promise<Application>} Configured Express application
 */
export async function createServer(): Promise<Application> {
  // Initialize database connection
  await initDatabase();
  
  const app = express();

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // Health check endpoint - no authentication required
  app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Apply API key authentication to all routes except health check
  app.use('/api', authenticateApiKey, proxyRouter);
  // Also mount directly at root for backward compatibility
  app.use('/', authenticateApiKey, proxyRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}
