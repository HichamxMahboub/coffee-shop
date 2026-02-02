import { Router } from "express";
import {
	getZReport,
	getZReportItems,
	getZReportIngredients,
} from "../controllers/reportsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/z", requireAuth, requireRole(["admin"]), getZReport);
router.get("/z/items", requireAuth, requireRole(["admin"]), getZReportItems);
router.get(
	"/z/ingredients",
	requireAuth,
	requireRole(["admin"]),
	getZReportIngredients
);

export default router;
