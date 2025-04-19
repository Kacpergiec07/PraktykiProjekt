import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createOrderSchema,
  orderParamSchema,
  orderQuerySchema,
} from "../validations/order.validation";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Order routes
router.post("/", validate(createOrderSchema), OrderController.createOrder);
router.get("/", validateQuery(orderQuerySchema), OrderController.getUserOrders);
router.get(
  "/:id",
  validateParams(orderParamSchema),
  OrderController.getOrderById
);
router.post(
  "/:id/cancel",
  validateParams(orderParamSchema),
  OrderController.cancelOrder
);

export const orderRouter = router;
