import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.statusCode || 500;
  const requestId = (req as any).requestId;

  if (status === 500) {
    console.error(`[${requestId}] Internal Server Error:`, err);
  }

  const payload = {
    error: {
      message: err.message || "Internal Server Error",
      code: err.code || undefined,
      details: err.details || undefined,
    },
    requestId,
  };

  res.status(status).json(payload);
};