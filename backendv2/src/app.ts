import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./middlewares/error.middleware";
import { adminOrderRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { drugRouter } from "./routes/drug.routes";
import { orderRouter } from "./routes/order.routes";
import { logger } from "./uttils/logger";
import { config } from "./config";

// Initialize express app
const app = express();

// Apply middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);

// Security middleware
app.use(helmet());

// Rate limiting
// app.use(
//   rateLimit({
//     windowMs: config.rateLimit.windowMs,
//     max: config.rateLimit.maxRequests,
//     message: {
//       status: "error",
//       message: "Too many requests, please try again later.",
//     },
//   })
// );

// Logging middleware
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// API routes
app.use(`${config.apiPrefix}/auth`, authRouter);
app.use(`${config.apiPrefix}/drugs`, drugRouter);
app.use(`${config.apiPrefix}/orders`, orderRouter);
app.use(`${config.apiPrefix}/admin/orders`, adminOrderRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "Server is running" });
});

// Apply error handler middleware
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(
    `API is available at http://localhost:${PORT}${config.apiPrefix}`
  );
});

export default app;
