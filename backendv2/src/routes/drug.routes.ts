import { Router } from "express";
import { DrugController } from "../controllers/drug.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createDrugSchema,
  updateDrugSchema,
  drugParamSchema,
  drugQuerySchema,
} from "../validations/drug.validation";
import { UserRole } from ".prisma/client";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes that all authenticated users can access
router.get("/", validateQuery(drugQuerySchema), DrugController.getDrugs);
router.get("/:id", validateParams(drugParamSchema), DrugController.getDrugById);

// Routes that only pharmacists and admins can access
router.post(
  "/",
  authorize(UserRole.PHARMACIST, UserRole.ADMIN),
  validate(createDrugSchema),
  DrugController.createDrug
);

router.patch(
  "/:id",
  authorize(UserRole.PHARMACIST, UserRole.ADMIN),
  validateParams(drugParamSchema),
  validate(updateDrugSchema),
  DrugController.updateDrug
);

router.delete(
  "/:id",
  authorize(UserRole.PHARMACIST, UserRole.ADMIN),
  validateParams(drugParamSchema),
  DrugController.deleteDrug
);

export const drugRouter = router;
