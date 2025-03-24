/**
 * Database configuration
 * @module config/database
 */
import { Pool, QueryResult, PoolClient } from 'pg';
import { logger } from '../utils/logger';
import { env } from './env.js';

// Create a connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT,
  ssl: env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined,
});

// Log pool events
pool.on('connect', () => {
  logger.debug('New client connected to database pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Execute a SQL query against the database
 * @param query SQL query string
 * @param params Query parameters
 * @param rowMode Row mode for the query (array or object)
 * @returns Query result
 */
export async function executeQuery(query: string, params: any[] = [], rowMode?: string): Promise<QueryResult> {
  let client: PoolClient | null = null;
  
  try {
    // Get client from pool
    client = await pool.connect();
    
    // Execute query
    const result = await client.query({
      text: query,
      values: params,
      rowMode: rowMode as any
    });
    
    return result;
  } catch (error) {
    logger.error('Database query error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      query: query.substring(0, 200),
      paramCount: params.length
    });
    throw error;
  } finally {
    // Release client back to pool
    if (client) {
      client.release();
    }
  }
}

// Initialize database connection on startup
export async function initDatabase(): Promise<void> {
  try {
    // Test connection
    const client = await pool.connect();
    logger.info('Database connection established successfully');
    client.release();
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }
}

// Helper function to mask sensitive connection string details for logging
function maskConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    return `${url.protocol}//${url.username}:****@${url.host}${url.pathname}`;
  } catch (e) {
    return 'invalid-connection-string';
  }
}
