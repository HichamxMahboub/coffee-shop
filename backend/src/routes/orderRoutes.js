import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/orders.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole(["admin"]), getOrders);
router.get("/:id", requireAuth, requireRole(["admin"]), getOrder);
router.post("/", requireAuth, requireRole(["admin", "cashier"]), createOrder);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["admin", "barista"]),
  updateOrderStatus
);

export default router;
