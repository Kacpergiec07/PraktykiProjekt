import bcrypt from "bcrypt";
import { User, UserRole } from ".prisma/client";
import { prisma } from "../uttils/prisma";
import { AppError } from "../uttils/app-error";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiryDate,
} from "../uttils/jwt";
import { config } from "../config";

// Define service interfaces
interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

/**
 * Auth service class
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw AppError.conflict("User with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role || UserRole.CUSTOMER,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to database
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Login a user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to database
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(token);

      // Check if refresh token exists in database
      const refreshTokenRecord = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!refreshTokenRecord) {
        throw AppError.unauthorized("Invalid refresh token");
      }

      // Check if token has expired
      if (refreshTokenRecord.expiresAt < new Date()) {
        // Delete expired token
        await prisma.refreshToken.delete({
          where: { id: refreshTokenRecord.id },
        });
        throw AppError.unauthorized("Refresh token has expired");
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        id: refreshTokenRecord.user.id,
        email: refreshTokenRecord.user.email,
        role: refreshTokenRecord.user.role,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.unauthorized("Invalid refresh token");
    }
  }

  /**
   * Logout a user by invalidating their refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound("User not found");
    }

    return user;
  }

  /**
   * Save refresh token to database
   */
  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    // Delete existing refresh tokens for user
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Calculate expiry date
    const expiresAt = getTokenExpiryDate(config.jwt.refreshExpiresIn);

    // Save new refresh token
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }
}

export const authService = new AuthService();
