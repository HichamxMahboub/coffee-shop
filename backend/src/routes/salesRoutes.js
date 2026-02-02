import { Router } from "express";
import { getSalesHistory, exportSalesCsv } from "../controllers/salesController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole(["admin"]), getSalesHistory);
router.get("/export", requireAuth, requireRole(["admin"]), exportSalesCsv);

export default router;
