/**
 * Environment variables configuration
 * Loads and validates all environment variables early
 */
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Define the paths to env files - prioritize .env.local over .env
const envLocalPath = path.resolve(rootDir, '.env.local');
const envPath = path.resolve(rootDir, '.env');

// Load environment variables from .env.local or .env
let envLoaded = false;
let loadedEnvPath = '';

// Try to load .env.local first
if (fs.existsSync(envLocalPath)) {
  const result = config({ path: envLocalPath });
  if (!result.error) {
    envLoaded = true;
    loadedEnvPath = envLocalPath;
    console.log(`Loaded environment variables from ${envLocalPath}`);
  }
}

// Fall back to .env if .env.local not found or had errors
if (!envLoaded && fs.existsSync(envPath)) {
  const result = config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    loadedEnvPath = envPath;
    console.log(`Loaded environment variables from ${envPath}`);
  } else {
    console.error('Error loading .env file:', result.error);
  }
}

if (!envLoaded) {
  console.error('No valid environment file found. Please create .env.local or .env file with required variables.');
}

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not found in environment. Using default connection string.');
  process.env.DATABASE_URL = "postgres://postgres:nVaQbzbAjHI2hpJKEMgG8VqlQhHtCxRQWMET7PXEoGqKO48olH2fdYCx3IGmja33@82.115.21.136:1205/postgres";
}

if (!process.env.API_KEY) {
  console.error('API_KEY not found in environment. Please add API_KEY to your .env.local or .env file.');
  throw new Error('Missing required environment variable: API_KEY');
}

// Export environment variables for easy access throughout the app
export const env = {
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX || '20'),
  DB_IDLE_TIMEOUT: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_KEY: process.env.API_KEY
};

// Log loaded environment variables (masked for security)
console.log('Environment variables loaded:', {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  DATABASE_URL: env.DATABASE_URL ? '******' : undefined,
  DB_POOL_MAX: env.DB_POOL_MAX,
  DB_IDLE_TIMEOUT: env.DB_IDLE_TIMEOUT,
  LOG_LEVEL: env.LOG_LEVEL,
  API_KEY: env.API_KEY ? '******' : undefined
});
