import Joi from "joi";
import { OrderStatus } from ".prisma/client";

// Create order validation schema
export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        drugId: Joi.string().required().uuid().messages({
          "string.empty": "Drug ID is required",
          "any.required": "Drug ID is required",
          "string.uuid": "Drug ID must be a valid UUID",
        }),
        quantity: Joi.number().required().min(0.01).messages({
          "number.base": "Quantity must be a number",
          "any.required": "Quantity is required",
          "number.min": "Quantity must be greater than 0",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one item is required",
      "any.required": "Items are required",
    }),
});

// Update order status validation schema
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required()
    .messages({
      "string.empty": "Status is required",
      "any.required": "Status is required",
      "any.only": "Status must be one of PENDING, COMPLETED, or CANCELLED",
    }),
});

// Order query validation schema
export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be a non-negative number",
  }),
  limit: Joi.number().integer().min(1).max(100).default(15).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be greater than 0",
    "number.max": "Limit must be less than or equal to 100",
  }),
  status: Joi.string().valid(...Object.values(OrderStatus)),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso().min(Joi.ref("fromDate")),
  sortBy: Joi.string()
    .valid("orderDate", "status", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Order parameter validation schema
export const orderParamSchema = Joi.object({
  id: Joi.string().required().uuid().messages({
    "string.empty": "Order ID is required",
    "any.required": "Order ID is required",
    "string.uuid": "Order ID must be a valid UUID",
  }),
});
