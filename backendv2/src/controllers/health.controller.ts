import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../uttils/prisma";

/**
 * Health controller class for checking system status
 */
export class HealthController {
  /**
   * Check API health
   */
  static async check(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          message: "API is healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV,
        },
      });
    } catch (error) {
      res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        status: "error",
        message: "API health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
