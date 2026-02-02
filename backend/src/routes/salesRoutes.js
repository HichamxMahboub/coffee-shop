import { Router } from "express";
import { getSalesHistory, exportSalesCsv } from "../controllers/salesController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getSalesHistory);
router.get("/export", requireAuth, exportSalesCsv);

export default router;
