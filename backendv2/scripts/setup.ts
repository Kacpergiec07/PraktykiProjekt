/**
 * Setup script for initializing the application
 * - Creates required directories
 * - Checks environment configuration
 * - Verifies database connection
 */

import fs from "fs";
import path from "path";
import { config } from "../src/config";
import { logger } from "../src/uttils/logger";
import { prisma } from "../src/uttils/prisma";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Required directories
const requiredDirs = ["logs", "dist", "docs", "prisma"];

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.resolve(__dirname, "../.env");

  if (!fs.existsSync(envPath)) {
    logger.warn(".env file not found. Creating from .env.example...");

    const exampleEnvPath = path.resolve(__dirname, "../.env.example");

    if (fs.existsSync(exampleEnvPath)) {
      fs.copyFileSync(exampleEnvPath, envPath);
      logger.info(
        ".env file created from example. Please update it with your configuration."
      );
    } else {
      logger.error(
        ".env.example file not found. Please create a .env file manually."
      );
      process.exit(1);
    }
  }
}

// Create required directories
function createDirectories() {
  requiredDirs.forEach((dir) => {
    const dirPath = path.resolve(__dirname, "..", dir);

    if (!fs.existsSync(dirPath)) {
      logger.info(`Creating directory: ${dir}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// Check database connection
async function checkDatabaseConnection() {
  try {
    logger.info("Checking database connection...");
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection successful.");
    return true;
  } catch (error) {
    logger.error("Database connection failed:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Check environment configuration
function checkEnvironmentConfig() {
  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.warn(`Missing environment variables: ${missingVars.join(", ")}`);
    logger.warn("Please update your .env file with the required variables.");
    return false;
  }

  return true;
}

// Main setup function
async function setup() {
  logger.info("Setting up application...");

  // Check .env file
  checkEnvFile();

  // Create required directories
  createDirectories();

  // Check environment configuration
  const configValid = checkEnvironmentConfig();
  if (!configValid) {
    logger.warn(
      "Environment configuration is incomplete. Some features may not work properly."
    );
  }

  // Check database connection
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    logger.warn(
      "Cannot connect to the database. This might be normal if the database file doesn't exist yet."
    );
    logger.info("Run prisma migrations to create the database schema.");
  }

  logger.info("Setup completed successfully.");
}

// Run setup
setup().catch((error) => {
  logger.error("Setup failed:", error);
  process.exit(1);
});
