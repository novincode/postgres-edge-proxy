/**
 * Type definitions for the application
 * @module types
 */

/**
 * Environment variables
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      DB_POOL_MAX?: string;
      DB_IDLE_TIMEOUT?: string;
      LOG_LEVEL?: string;
    }
  }
}

export {};
