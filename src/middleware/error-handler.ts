/**
 * Error handling middleware
 * @module middleware/error-handler
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error, 
  req: Request, 
  res: Response, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  logger.error(`Error: ${err.message}`, { 
    path: req.path,
    method: req.method,
    stack: err.stack 
  });

  res.status(statusCode).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }
  });
}
