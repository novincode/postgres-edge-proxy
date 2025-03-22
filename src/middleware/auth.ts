/**
 * Authentication middleware
 * @module middleware/auth
 */
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * API key authentication middleware
 * Verifies that the provided API key matches the one in environment variables
 */
export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  // Get API key from request header
  const apiKey = req.header('X-API-Key');

  // Check if API key is provided
  if (!apiKey) {
    res.status(401);
    return next(new Error('API key is required'));
  }

  // Validate API key
  if (apiKey !== env.API_KEY) {
    res.status(403);
    return next(new Error('Invalid API key'));
  }

  // If valid, proceed to the next middleware
  next();
}
