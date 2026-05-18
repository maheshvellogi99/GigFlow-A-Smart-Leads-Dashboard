// ============================================================
// GigFlow — Centralized Error Handling Middleware
// Catches all unhandled errors from controllers and services,
// logs them, and returns a clean JSON response to the client.
// ============================================================

import { Request, Response, NextFunction } from "express";

// ---- Custom Error Interface ----

interface AppError extends Error {
  statusCode?: number;
}

// ---- Error Handler Middleware ----

const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode: number = err.statusCode || 500;
  const message: string = err.message || "Internal Server Error";

  // Log the error for server-side debugging
  console.error(`[GigFlow Error] ${new Date().toISOString()}`);
  console.error(`  Status: ${statusCode}`);
  console.error(`  Message: ${message}`);

  if (process.env.NODE_ENV !== "production") {
    console.error(`  Stack: ${err.stack || "No stack trace available"}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
