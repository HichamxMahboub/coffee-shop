import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrder,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getOrders);
router.get("/:id", requireAuth, getOrder);
router.post("/", requireAuth, createOrder);

export default router;
