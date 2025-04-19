import winston from "winston";
import { config } from "../config";

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create the logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(timestamp(), logFormat),
  transports: [
    // File transport for errors
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // File transport for all logs
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If we're not in production, also log to the console with colors
if (config.env !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    })
  );
}
