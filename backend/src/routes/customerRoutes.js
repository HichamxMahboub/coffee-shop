import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customerController.js";

const router = Router();

router.get("/", requireAuth, getCustomers);
router.post("/", requireAuth, createCustomer);
router.put("/:id", requireAuth, updateCustomer);

export default router;
