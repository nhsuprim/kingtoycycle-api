import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../helpers/ApiError';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../config/db';

// Extend Express's Request type with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roleId: string | null;
        permissions: string[];
      };
    }
  }
}

/**
 * Verifies the access token (from HTTP-only cookie or Authorization header),
 * loads the user's role + permissions, and attaches it to req.user.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : undefined;
    const token = req.cookies?.accessToken || bearer;

    if (!token) {
      throw ApiError.unauthorized('Access token missing');
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: { include: { permissions: true } } },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw ApiError.unauthorized('User not found or inactive');
    }

    req.user = {
      id: user.id,
      roleId: user.roleId ?? null,
      permissions: user.role?.permissions.map((p: { key: string }) => p.key) ?? [],
    };

    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}
