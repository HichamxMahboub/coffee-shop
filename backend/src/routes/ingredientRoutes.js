import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredientController.js";

const router = Router();

router.get("/", requireAuth, requireRole(["admin"]), getIngredients);
router.post("/", requireAuth, requireRole(["admin"]), createIngredient);
router.put("/:id", requireAuth, requireRole(["admin"]), updateIngredient);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteIngredient);

export default router;
