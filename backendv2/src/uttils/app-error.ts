import { StatusCodes } from "http-status-codes";

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  errors?: string[];
  isOperational: boolean;

  constructor(
    message: string,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    errors?: string[],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: string[]): AppError {
    return new AppError(message, StatusCodes.BAD_REQUEST, errors);
  }

  static unauthorized(message = "Unauthorized", errors?: string[]): AppError {
    return new AppError(message, StatusCodes.UNAUTHORIZED, errors);
  }

  static forbidden(message = "Forbidden", errors?: string[]): AppError {
    return new AppError(message, StatusCodes.FORBIDDEN, errors);
  }

  static notFound(message = "Resource not found", errors?: string[]): AppError {
    return new AppError(message, StatusCodes.NOT_FOUND, errors);
  }

  static conflict(message: string, errors?: string[]): AppError {
    return new AppError(message, StatusCodes.CONFLICT, errors);
  }

  static internalServer(
    message = "Internal server error",
    errors?: string[]
  ): AppError {
    return new AppError(
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      errors,
      false
    );
  }
}
