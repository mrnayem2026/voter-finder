import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { loginSchema } from "./auth.schema.js";

const router = Router();

// Public route
router.post("/login", validate(loginSchema), AuthController.login);

// Protected route
router.get("/me", authenticate, AuthController.getProfile);

export default router;
