import { z } from "zod";
import { query } from "../db.js";

const ingredientSchema = z.object({
  nom: z.string().min(2),
  quantite: z.number().nonnegative(),
  unite: z.string().min(1),
  seuilAlerte: z.number().nonnegative().optional(),
});

export async function getIngredients(req, res, next) {
  try {
    const result = await query(
      "SELECT id, nom, quantite, unite, seuil_alerte FROM ingredients ORDER BY nom"
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function createIngredient(req, res, next) {
  try {
    const data = ingredientSchema.parse(req.body);
    const result = await query(
      "INSERT INTO ingredients (nom, quantite, unite, seuil_alerte) VALUES ($1, $2, $3, $4) RETURNING *",
      [data.nom, data.quantite, data.unite, data.seuilAlerte ?? 0]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}

export async function updateIngredient(req, res, next) {
  try {
    const data = ingredientSchema.partial().parse(req.body);
    const existing = await query("SELECT * FROM ingredients WHERE id = $1", [
      req.params.id,
    ]);

    if (!existing.rows[0]) {
      return res.status(404).json({ message: "Ingrédient introuvable" });
    }

    const current = existing.rows[0];
    const result = await query(
      "UPDATE ingredients SET nom = $1, quantite = $2, unite = $3, seuil_alerte = $4 WHERE id = $5 RETURNING *",
      [
        data.nom ?? current.nom,
        data.quantite ?? current.quantite,
        data.unite ?? current.unite,
        data.seuilAlerte ?? current.seuil_alerte,
        req.params.id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}

export async function deleteIngredient(req, res, next) {
  try {
    await query("DELETE FROM ingredients WHERE id = $1", [req.params.id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
