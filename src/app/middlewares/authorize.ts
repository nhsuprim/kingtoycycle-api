import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../helpers/ApiError';

/**
 * Role-Based Access Control (Section 18).
 * Usage: router.post('/products', authenticate, authorize('PRODUCT_CREATE'), handler)
 *
 * An Admin role should be seeded with all permission keys; Staff roles get
 * only the specific permissions granted to them.
 */
export function authorize(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const hasPermission = requiredPermissions.every((perm) =>
      req.user!.permissions.includes(perm)
    );

    if (!hasPermission) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
}
