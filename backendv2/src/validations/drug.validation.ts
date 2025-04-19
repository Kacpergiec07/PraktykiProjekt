import Joi from "joi";

// Create drug validation schema
export const createDrugSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(255).messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
    "string.min": "Name must not be empty",
    "string.max": "Name must be less than 255 characters",
  }),
  dose: Joi.number().required().min(0).messages({
    "number.base": "Dose must be a number",
    "any.required": "Dose is required",
    "number.min": "Dose must be a non-negative number",
  }),
  price: Joi.number().required().min(0).messages({
    "number.base": "Price must be a number",
    "any.required": "Price is required",
    "number.min": "Price must be a non-negative number",
  }),
  type: Joi.string().required().trim().min(1).max(255).messages({
    "string.empty": "Type is required",
    "any.required": "Type is required",
    "string.min": "Type must not be empty",
    "string.max": "Type must be less than 255 characters",
  }),
  companyName: Joi.string().required().trim().min(1).max(255).messages({
    "string.empty": "Company name is required",
    "any.required": "Company name is required",
    "string.min": "Company name must not be empty",
    "string.max": "Company name must be less than 255 characters",
  }),
  amount: Joi.number().required().min(0).messages({
    "number.base": "Amount must be a number",
    "any.required": "Amount is required",
    "number.min": "Amount must be a non-negative number",
  }),
});

// Update drug validation schema
export const updateDrugSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).messages({
    "string.min": "Name must not be empty",
    "string.max": "Name must be less than 255 characters",
  }),
  dose: Joi.number().min(0).messages({
    "number.base": "Dose must be a number",
    "number.min": "Dose must be a non-negative number",
  }),
  price: Joi.number().min(0).messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be a non-negative number",
  }),
  type: Joi.string().trim().min(1).max(255).messages({
    "string.min": "Type must not be empty",
    "string.max": "Type must be less than 255 characters",
  }),
  companyName: Joi.string().trim().min(1).max(255).messages({
    "string.min": "Company name must not be empty",
    "string.max": "Company name must be less than 255 characters",
  }),
  amount: Joi.number().min(0).messages({
    "number.base": "Amount must be a number",
    "number.min": "Amount must be a non-negative number",
  }),
})
  .min(1)
  .message("At least one field must be provided for update");

// Drug query validation schema
export const drugQuerySchema = Joi.object({
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
  name: Joi.string(),
  companyName: Joi.string(),
  type: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  sortBy: Joi.string()
    .valid("name", "price", "companyName", "amount", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Drug parameter validation schema
export const drugParamSchema = Joi.object({
  id: Joi.string().required().uuid().messages({
    "string.empty": "Drug ID is required",
    "any.required": "Drug ID is required",
    "string.uuid": "Drug ID must be a valid UUID",
  }),
});
