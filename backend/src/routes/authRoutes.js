import { Router } from "express";
import { login, me, refreshToken, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Connexion du personnel
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Profil utilisateur connecté
router.get("/me", requireAuth, me);

export default router;
