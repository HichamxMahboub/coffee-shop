import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customerController.js";

const router = Router();

router.get("/", requireAuth, requireRole(["admin", "cashier"]), getCustomers);
router.post("/", requireAuth, requireRole(["admin", "cashier"]), createCustomer);
router.put("/:id", requireAuth, requireRole(["admin", "cashier"]), updateCustomer);

export default router;
