import { Router } from "express";
import {
  getProducts,
  getProduct,
  getProductVariants,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole(["admin", "cashier"]), getProducts);
router.get("/:id", requireAuth, requireRole(["admin", "cashier"]), getProduct);
router.get(
  "/:id/variants",
  requireAuth,
  requireRole(["admin", "cashier"]),
  getProductVariants
);
router.post("/", requireAuth, requireRole(["admin"]), createProduct);
router.put("/:id", requireAuth, requireRole(["admin"]), updateProduct);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteProduct);

export default router;
