/**
 * Error handling middleware
 * @module middleware/error-handler
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  logger.error(err.message, {
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
