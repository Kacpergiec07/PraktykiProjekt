import Joi from "joi";
import { UserRole } from ".prisma/client";

// Register validation schema
export const registerSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase().max(255).messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be less than 64 characters",
      "string.empty": "Password is required",
      "any.required": "Password is required",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  firstName: Joi.string().required().trim().min(1).max(100).messages({
    "string.empty": "First name is required",
    "any.required": "First name is required",
    "string.min": "First name must not be empty",
    "string.max": "First name must be less than 100 characters",
  }),
  lastName: Joi.string().required().trim().min(1).max(100).messages({
    "string.empty": "Last name is required",
    "any.required": "Last name is required",
    "string.min": "Last name must not be empty",
    "string.max": "Last name must be less than 100 characters",
  }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.CUSTOMER),
});

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase().max(255).messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token is required",
    "any.required": "Refresh token is required",
  }),
});
