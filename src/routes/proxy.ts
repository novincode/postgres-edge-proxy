/**
 * Proxy route definitions
 * @module routes/proxy
 */
import { Router, Request, Response, NextFunction } from 'express';
import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';

// Add explicit Router type annotation to fix the error
export const proxyRouter: Router = Router();

/**
 * @typedef {Object} ProxyRequest
 * @property {string} query - SQL query to execute
 * @property {any[]} params - Parameters for the SQL query
 */
interface ProxyRequest {
  query: string;
  params: any[];
}

/**
 * Execute database query from request
 * @route POST /db-proxy
 * @param {ProxyRequest} req.body - Query and parameters
 * @returns {Object} Query results
 */
proxyRouter.post('/db-proxy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, params }: ProxyRequest = req.body;
    
    // Validate request
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Log query with additional info
    logger.debug(`Executing query: ${query.substring(0, 150)}${query.length > 150 ? '...' : ''}`, { 
      paramCount: params?.length || 0,
      queryType: query.trim().split(' ')[0].toUpperCase() // Get the command type (SELECT, INSERT, etc.)
    });
    
    const result = await executeQuery(query, params);
    
    // Add safety check for result format
    if (!result) {
      logger.warn('Query returned null or undefined result');
      return res.json({ rows: [], rowCount: 0, command: '', fields: [] });
    }
    
    // Send response
    res.json(result);
  } catch (error) {
    logger.error('Error executing query', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    next(error);
  }
});

// Drizzle ORM compatible endpoint
proxyRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { sql, params, method } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'Missing required parameter: sql' });
    }
    
    // Prevent multiple queries as shown in Drizzle docs
    const sqlBody = sql.replace(/;/g, '');
    
    // Execute query with proper row mode for Drizzle compatibility
    const result = await executeQuery(
      sqlBody, 
      params || [], 
      method === 'all' ? 'array' : undefined
    );
    
    // Just return the rows (not the full result object)
    return res.json(result.rows);
  } catch (error) {
    logger.error('Drizzle query execution error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});
