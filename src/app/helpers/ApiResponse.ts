import { Response } from 'express';

interface SuccessPayload<T> {
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  statusCode = 200,
  { message = 'Success', data, meta }: SuccessPayload<T> = {}
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    ...(meta ? { meta } : {}),
  });
}
