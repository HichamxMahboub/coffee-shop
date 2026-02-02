import { z } from "zod";
import { query } from "../db.js";

const customerSchema = z.object({
  nom: z.string().min(2),
  email: z.string().email().optional().nullable(),
});

const updateSchema = z.object({
  nom: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  points: z.number().int().nonnegative().optional(),
});

export async function getCustomers(req, res, next) {
  try {
    const result = await query(
      "SELECT id, nom, email, points FROM customers ORDER BY nom"
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const { nom, email } = customerSchema.parse(req.body);
    const result = await query(
      "INSERT INTO customers (nom, email) VALUES ($1, $2) RETURNING *",
      [nom, email || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const data = updateSchema.parse(req.body);
    const existing = await query("SELECT * FROM customers WHERE id = $1", [
      req.params.id,
    ]);

    if (!existing.rows[0]) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    const current = existing.rows[0];
    const result = await query(
      "UPDATE customers SET nom = $1, email = $2, points = $3 WHERE id = $4 RETURNING *",
      [
        data.nom ?? current.nom,
        data.email ?? current.email,
        data.points ?? current.points,
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
