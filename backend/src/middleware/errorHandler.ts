import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { config } from '../config';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Server error caught by centralized handler:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  if (config.nodeEnv === 'production') {
    return sendError(res, statusCode === 500 ? 'An unexpected error occurred.' : message, statusCode);
  }

  return sendError(res, message, statusCode, err.errors || [err.stack]);
}
