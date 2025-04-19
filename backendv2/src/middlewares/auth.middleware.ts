import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { config } from "../config";
import { AppError } from "../uttils/app-error";
import { UserRole } from ".prisma/client";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware to verify JWT and authenticate user
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized(
        "Authorization header missing or invalid format"
      );
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      id: string;
      email: string;
      role: UserRole;
    };

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized("Invalid or expired token"));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("User not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden("You do not have permission to perform this action")
      );
    }

    next();
  };
};
