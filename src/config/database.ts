/**
 * Database configuration
 * @module config/database
 */
import pg from 'pg';
import { logger } from '../utils/logger';
import { env } from './env.js';

const { Pool } = pg;
type PoolConfig = pg.PoolConfig;

// Database URL is validated in env.ts already
logger.info(`Initializing database connection`);

// Configure PostgreSQL connection
const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Execute a database query
 * @param {string} query - SQL query string
 * @param {any[]} params - Query parameters
 * @returns {Promise<any>} Query result
 */
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const client = await pool.connect();
  try {
    logger.debug(`Executing query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    const result = await client.query(query, params);
    
    // Return a more complete result structure that's compatible with Neon/Drizzle
    return {
      rows: result.rows,
      command: result.command,
      rowCount: result.rowCount,
      fields: result.fields?.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID
      })),
      // Include these fields that Neon client might expect
      rowAsArray: false,
      rowDescription: result.fields?.map(field => ({
        name: field.name,
        tableID: field.tableID,
        columnID: field.columnID,
        dataTypeID: field.dataTypeID,
        dataTypeSize: field.dataTypeSize,
        dataTypeModifier: field.dataTypeModifier,
        format: field.format
      }))
    };
  } catch (error) {
    logger.error(`Query error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  } finally {
    client.release();
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
