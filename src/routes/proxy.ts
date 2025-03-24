/**
 * Proxy route definitions
 * @module routes/proxy
 */
import { Router, Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';

export const proxyRouter: Router = Router();

// Drizzle ORM compatible endpoint - exactly matching the Drizzle docs
proxyRouter.post('/query', async (req: Request, res: Response) => {
  const { sql, params, method } = req.body;

  // prevent multiple queries
  const sqlBody = sql.replace(/;/g, '');

  try {
    const result = await executeQuery(
      sqlBody, 
      params || [], 
      method === 'all' ? 'array' : undefined
    );
    return res.send(result.rows);
  } catch (e: any) {
    logger.error('Database query error:', e);
    return res.status(500).json({ error: e });
  }
});
