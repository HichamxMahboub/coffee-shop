import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole(["admin", "cashier"]), getSettings);
router.put("/", requireAuth, requireRole(["admin"]), updateSettings);

export default router;
