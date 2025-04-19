import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "../uttils/logger";
import { AppError } from "../uttils/app-error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errors: string[] = [];

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
    logger.warn(`AppError: ${message}`);
  }
  // Handle Prisma errors
  else if (err instanceof PrismaClientKnownRequestError) {
    statusCode = StatusCodes.BAD_REQUEST;

    // Handle specific Prisma error codes
    switch (err.code) {
      case "P2002": // Unique constraint failed
        message = `Unique constraint failed on the ${err.meta?.target}`;
        break;
      case "P2025": // Record not found
        statusCode = StatusCodes.NOT_FOUND;
        message = "Record not found";
        break;
      default:
        message = "Database error occurred";
    }

    logger.error(`Prisma error: ${err.code} - ${err.message}`);
  }
  // Handle other errors
  else {
    logger.error(`Unhandled error: ${err.message}`);
    logger.error(err.stack || "");
  }

  // Send error response
  res.status(statusCode).json({
    status: "error",
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
