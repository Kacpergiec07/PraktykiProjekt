import { Router } from "express";
import { AdminOrderController } from "../controllers/order.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  updateOrderStatusSchema,
  orderParamSchema,
  orderQuerySchema,
} from "../validations/order.validation";
import { UserRole } from ".prisma/client";

const router = Router();

// Apply authentication and authorization to all routes
router.use(authenticate);
router.use(authorize(UserRole.EMPLOYEE, UserRole.PHARMACIST, UserRole.ADMIN));

// Admin order routes
router.get(
  "/",
  validateQuery(orderQuerySchema),
  AdminOrderController.getAllOrders
);
router.patch(
  "/:id/status",
  validateParams(orderParamSchema),
  validate(updateOrderStatusSchema),
  AdminOrderController.updateOrderStatus
);
router.get("/stats/revenue", AdminOrderController.getRevenueStats);

export const adminOrderRouter = router;
