import { z } from "zod";
import { query } from "../db.js";

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  loyaltyPoints: z.number().int().nonnegative().optional(),
});

export async function getCustomers(req, res, next) {
  try {
    const result = await query(
      "SELECT id, name, email, loyalty_points FROM customers ORDER BY name"
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const { name, email } = customerSchema.parse(req.body);
    const result = await query(
      "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *",
      [name, email || null]
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
      "UPDATE customers SET name = $1, email = $2, loyalty_points = $3 WHERE id = $4 RETURNING *",
      [
        data.name ?? current.name,
        data.email ?? current.email,
        data.loyaltyPoints ?? current.loyalty_points,
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
