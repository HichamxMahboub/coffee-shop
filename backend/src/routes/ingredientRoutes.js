import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredientController.js";

const router = Router();

router.get("/", requireAuth, getIngredients);
router.post("/", requireAuth, createIngredient);
router.put("/:id", requireAuth, updateIngredient);
router.delete("/:id", requireAuth, deleteIngredient);

export default router;
