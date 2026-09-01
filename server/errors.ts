import type { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = "ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }

  const anyErr = err as { name?: string; code?: number; message?: string; status?: number };

  if (anyErr?.name === "ValidationError") {
    return res.status(400).json({ error: "Invalid input", code: "VALIDATION" });
  }
  if (anyErr?.code === 11000) {
    return res.status(409).json({ error: "Duplicate record", code: "DUPLICATE" });
  }
  if (anyErr?.name === "JsonWebTokenError" || anyErr?.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired session", code: "AUTH" });
  }
  if (anyErr?.status && anyErr.message) {
    return res.status(anyErr.status).json({ error: anyErr.message, code: "ERROR" });
  }

  console.error("Unhandled error:", anyErr?.message || err);
  return res.status(500).json({ error: "Internal server error", code: "INTERNAL" });
}
