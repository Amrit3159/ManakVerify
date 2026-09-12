import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode = 400,
  errors: any[] = []
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
