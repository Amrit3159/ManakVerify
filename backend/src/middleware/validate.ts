import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(
          res,
          'Validation failed',
          400,
          error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        );
      }
      return sendError(res, 'Invalid request data', 400);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(
          res,
          'Validation failed',
          400,
          error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        );
      }
      return sendError(res, 'Invalid query parameters', 400);
    }
  };
}
