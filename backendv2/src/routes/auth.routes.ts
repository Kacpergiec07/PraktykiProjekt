import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validations/auth.validation";
import { authenticate } from "../middlewares/auth.middleware";
import { rateLimit } from "express-rate-limit";
import { config } from "../config";

const router = Router();

// Rate limits
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    status: "error",
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per window
  message: {
    status: "error",
    message: "Too many registration attempts, please try again after an hour",
  },
});

// Routes
router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  AuthController.register
);
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  AuthController.login
);
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  AuthController.refreshToken
);
router.post("/logout", validate(refreshTokenSchema), AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export const authRouter = router;
