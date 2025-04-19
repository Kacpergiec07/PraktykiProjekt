import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../uttils/app-error";

/**
 * Middleware to validate request data against a Joi schema
 */
export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(AppError.badRequest("Validation error", errorMessages));
    }

    next();
  };
};

/**
 * Middleware to validate request query parameters against a Joi schema
 */
export const validateQuery = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(AppError.badRequest("Query validation error", errorMessages));
    }

    next();
  };
};

/**
 * Middleware to validate request parameters against a Joi schema
 */
export const validateParams = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(
        AppError.badRequest("Parameter validation error", errorMessages)
      );
    }

    next();
  };
};
