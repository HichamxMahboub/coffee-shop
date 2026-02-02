import { Router } from "express";
import { getPendingOrders } from "../controllers/baristaController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/pending", requireAuth, requireRole(["admin", "barista"]), getPendingOrders);

export default router;
