import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public endpoint for chat (no authentication required for basic interaction)
// In production, you may want to add rate limiting here
router.post("/chat", AiController.chatCompletion);

// Protected endpoints (require authentication)
router.use(authenticate);
router.post("/execute-tool", AiController.executeTool);
router.get("/tools", AiController.getTools);

export const aiRouter = router;
