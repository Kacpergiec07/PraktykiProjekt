import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "../services/auth.service";
import { logger } from "../uttils/logger";

/**
 * Auth controller class
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      res.status(StatusCodes.CREATED).json({
        status: "success",
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login a user
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.login({
        email,
        password,
      });

      res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshToken(refreshToken);

      res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout a user
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      await authService.logout(refreshToken);

      res.status(StatusCodes.OK).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  static async me(
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

      const user = await authService.getUserById(userId);

      res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
