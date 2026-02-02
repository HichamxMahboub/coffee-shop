import { z } from "zod";
import { query } from "../db.js";

const ingredientSchema = z.object({
  name: z.string().min(2),
  unit: z.enum(["ml", "g", "unit"]),
  stockQuantity: z.number().nonnegative(),
  alertThreshold: z.number().nonnegative().optional(),
});

export async function getIngredients(req, res, next) {
  try {
    const result = await query(
      "SELECT id, name, unit, stock_quantity, alert_threshold FROM ingredients ORDER BY name"
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
      "INSERT INTO ingredients (name, unit, stock_quantity, alert_threshold) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        data.name,
        data.unit,
        data.stockQuantity,
        data.alertThreshold ?? 0,
      ]
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
      "UPDATE ingredients SET name = $1, unit = $2, stock_quantity = $3, alert_threshold = $4 WHERE id = $5 RETURNING *",
      [
        data.name ?? current.name,
        data.unit ?? current.unit,
        data.stockQuantity ?? current.stock_quantity,
        data.alertThreshold ?? current.alert_threshold,
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
