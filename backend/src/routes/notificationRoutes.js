import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const readySchema = z.object({
  orderId: z.number().int(),
  status: z.enum(["completed"]),
});

router.post(
  "/ready",
  requireAuth,
  requireRole(["admin", "barista"]),
  (req, res) => {
    try {
      const { orderId, status } = readySchema.parse(req.body);
      console.log("KDS READY", { orderId, status, at: new Date().toISOString() });
      return res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides" });
      }
      return res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
);

export default router;