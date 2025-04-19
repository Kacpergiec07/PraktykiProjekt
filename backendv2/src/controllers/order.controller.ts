import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderStatus } from ".prisma/client";
import { orderService } from "../services/order.service";

/**
 * Order controller class
 */
export class OrderController {
  /**
   * Create a new order
   */
  static async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          message: "Not authenticated",
        });
        return;
      }

      const { items } = req.body;

      const order = await orderService.createOrder({
        userId,
        items,
      });

      res.status(StatusCodes.CREATED).json({
        status: "success",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          message: "Not authenticated",
        });
        return;
      }

      const order = await orderService.getOrderById(id);

      // Check if the user owns the order or is an admin/employee/pharmacist
      if (order.userId !== userId && userRole === "CUSTOMER") {
        res.status(StatusCodes.FORBIDDEN).json({
          status: "error",
          message: "You do not have permission to view this order",
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        status: "success",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          message: "Not authenticated",
        });
        return;
      }

      const { page, limit, status, fromDate, toDate, sortBy, sortOrder } =
        req.query;

      const result = await orderService.getOrders({
        userId,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as OrderStatus,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      res.status(StatusCodes.OK).json({
        status: "success",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          status: "error",
          message: "Not authenticated",
        });
        return;
      }

      // Check if user has permission to cancel the order
      const order = await orderService.getOrderById(id);

      // Only the user who created the order or admin can cancel it
      if (order.userId !== userId && userRole === "CUSTOMER") {
        res.status(StatusCodes.FORBIDDEN).json({
          status: "error",
          message: "You do not have permission to cancel this order",
        });
        return;
      }

      const cancelledOrder = await orderService.cancelOrder(id);

      res.status(StatusCodes.OK).json({
        status: "success",
        data: cancelledOrder,
      });
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Admin Order controller class
 */
export class AdminOrderController {
  /**
   * Get all orders (admin only)
   */
  static async getAllOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, status, fromDate, toDate, sortBy, sortOrder } =
        req.query;

      const result = await orderService.getOrders({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as OrderStatus,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      res.status(StatusCodes.OK).json({
        status: "success",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (admin only)
   */
  static async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(id, status);

      res.status(StatusCodes.OK).json({
        status: "success",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue statistics
   */
  static async getRevenueStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fromDate, toDate } = req.query;

      const totalRevenue = await orderService.getTotalRevenue(
        fromDate ? new Date(fromDate as string) : undefined,
        toDate ? new Date(toDate as string) : undefined
      );

      res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          totalRevenue,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
