import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Parse environment variables
export const config = {
  // Application settings
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  apiPrefix: process.env.API_PREFIX || "/api",

  // JWT settings
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "your_jwt_access_secret_key",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret_key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Database settings
  database: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // Default: 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },

  // CORS
  cors: {
    allowedOrigins: (
      process.env.ALLOWED_ORIGINS || "http://localhost:5173"
    ).split(","),
  },
};
