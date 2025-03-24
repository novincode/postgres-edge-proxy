/**
 * Authentication middleware
 * @module middleware/auth
 */
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * API key authentication middleware
 * Verifies that the provided API key matches the one in environment variables
 */
export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  // Get API key from request header
  const apiKey = req.header('X-API-Key');

  // Check if API key is provided
  if (!apiKey) {
    logger.warn('Authentication failed: No API key provided', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    return res.status(401).json({ error: 'API key is required' });
  }

  // Validate API key
  if (apiKey !== env.API_KEY) {
    logger.warn('Authentication failed: Invalid API key', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // If valid, proceed to the next middleware
  next();
}
