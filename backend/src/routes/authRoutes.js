import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Connexion du personnel
router.post("/login", login);

// Profil utilisateur connecté
router.get("/me", requireAuth, me);

export default router;
