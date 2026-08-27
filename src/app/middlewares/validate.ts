import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../helpers/ApiError';

/**
 * Validates req.body / req.query / req.params against a Zod schema.
 * Usage: router.post('/login', validate(loginSchema), handler)
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.badRequest('Validation failed', err.flatten()));
      }
      next(err);
    }
  };
}
