import jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { UserRole } from ".prisma/client";
import ms from "ms";

// Define payload interfaces
interface AccessTokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

interface RefreshTokenPayload {
  id: string;
}

/**
 * Generate an access token
 */
export const generateAccessToken = (user: AccessTokenPayload): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const secret = String(config.jwt.accessSecret);

  // Type assertion for expiresIn to help TypeScript
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as ms.StringValue,
  };

  return jwt.sign(payload, secret, options);
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const payload = {
    id: userId,
  };
  const secret = String(config.jwt.refreshSecret);

  // Type assertion for expiresIn to help TypeScript
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as ms.StringValue,
  };

  return jwt.sign(payload, secret, options);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = String(config.jwt.accessSecret);
  return jwt.verify(token, secret) as AccessTokenPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const secret = String(config.jwt.refreshSecret);
  return jwt.verify(token, secret) as RefreshTokenPayload;
};

/**
 * Calculate token expiry date
 */
export const getTokenExpiryDate = (expiresIn: string): Date => {
  // Parse expiresIn string (e.g., '7d', '15m')
  const unit = expiresIn.charAt(expiresIn.length - 1);
  const value = parseInt(expiresIn.slice(0, -1), 10);

  const now = new Date();

  switch (unit) {
    case "s":
      return new Date(now.getTime() + value * 1000);
    case "m":
      return new Date(now.getTime() + value * 60 * 1000);
    case "h":
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case "d":
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default:
      throw new Error(`Invalid expiry format: ${expiresIn}`);
  }
};
