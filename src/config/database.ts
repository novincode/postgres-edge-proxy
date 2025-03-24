/**
 * Database configuration
 * @module config/database
 */
import pkg from 'pg';
const { Client, Pool } = pkg;
import { logger } from '../utils/logger';
import { env } from './env.js';

// Use a pool instead of a single client for better resilience
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Handle pool errors at the global level
pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
  // Don't crash the app on connection error
  // process.exit(-1);
});

// Connect to the database
export async function initDatabase(): Promise<void> {
  try {
    // Test the connection by getting and releasing a client
    const client = await pool.connect();
    client.release();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }
}

/**
 * Execute a SQL query against the database
 * @param query SQL query string
 * @param params Query parameters
 * @param rowMode Row mode for the query
 * @returns Query result
 */
export async function executeQuery(query: string, params: any[] = [], rowMode?: string): Promise<any> {
  const client = await pool.connect();
  try {
    logger.debug(`Executing query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    const result = await client.query({
      text: query,
      values: params,
      rowMode: rowMode as any
    });
    return result;
  } catch (error) {
    logger.error('Database query error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      query: query.substring(0, 200)
    });
    throw error;
  } finally {
    // Make sure the client is always released back to the pool
    client.release();
  }
}
