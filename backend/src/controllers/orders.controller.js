import { z } from "zod";
import { query, pool } from "../db.js";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1),
  paymentMethod: z.string().min(1).optional(),
  customerId: z.number().int().optional().nullable(),
});

// Création d'une commande (POS)
export async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const { items, paymentMethod, customerId } = orderSchema.parse(req.body);

    await client.query("BEGIN");

    let total = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    let appliedDiscount = 0;
    let earnedPoints = 0;
    let customerRow = null;

    if (customerId) {
      const customerResult = await client.query(
        "SELECT id, loyalty_points FROM customers WHERE id = $1 FOR UPDATE",
        [customerId]
      );
      customerRow = customerResult.rows[0];

      if (!customerRow) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Client introuvable" });
      }

      if (Number(customerRow.loyalty_points) > 50) {
        appliedDiscount = 5;
        total = Math.max(0, total - appliedDiscount);
      }

      earnedPoints = Math.floor(total);
    }

    const requiredByIngredient = new Map();

    for (const item of items) {
      const ingredientsResult = await client.query(
        `
        SELECT ingredient_id, quantity_needed
        FROM product_ingredients
        WHERE product_id = $1
        `,
        [item.productId]
      );

      for (const row of ingredientsResult.rows) {
        const required = Number(row.quantity_needed) * item.quantity;
        const current = requiredByIngredient.get(row.ingredient_id) || 0;
        requiredByIngredient.set(row.ingredient_id, current + required);
      }
    }

    for (const [ingredientId, required] of requiredByIngredient.entries()) {
      const inventoryResult = await client.query(
        `
        SELECT id, name, stock_quantity, unit
        FROM ingredients
        WHERE id = $1
        FOR UPDATE
        `,
        [ingredientId]
      );

      const ingredient = inventoryResult.rows[0];

      if (!ingredient) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "Ingrédient introuvable dans l'inventaire" });
      }

      if (Number(ingredient.stock_quantity) < required) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Stock insuffisant pour ${ingredient.name} (${ingredient.unit})`,
        });
      }
    }

    const orderResult = await client.query(
      `
      INSERT INTO orders (utilisateur_id, customer_id, total, payment_method)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [req.user.id, customerId || null, total, paymentMethod || "cash"]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (commande_id, produit_id, quantite, prix_unitaire)
        VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.productId, item.quantity, item.unitPrice]
      );
    }

    for (const [ingredientId, required] of requiredByIngredient.entries()) {
      await client.query(
        "UPDATE ingredients SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [required, ingredientId]
      );
    }

    if (customerRow) {
      const newPoints = Math.max(
        0,
        Number(customerRow.loyalty_points) - (appliedDiscount ? 50 : 0) + earnedPoints
      );
      await client.query("UPDATE customers SET loyalty_points = $1 WHERE id = $2", [
        newPoints,
        customerRow.id,
      ]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      id: orderId,
      total,
      discount: appliedDiscount,
      earnedPoints,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  } finally {
    client.release();
  }
}

// Liste des commandes
export async function getOrders(req, res, next) {
  try {
    const result = await query(
      `
      SELECT o.id, o.created_at AS created_at, o.total AS total_amount,
             o.payment_method AS payment_method,
             u.nom AS cashier
      FROM orders o
      LEFT JOIN users u ON u.id = o.utilisateur_id
      ORDER BY o.created_at DESC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

// Détail d'une commande
export async function getOrder(req, res, next) {
  try {
    const orderResult = await query(
      `
      SELECT o.id, o.created_at AS created_at, o.total AS total_amount,
             o.payment_method AS payment_method,
             u.nom AS cashier
      FROM orders o
      LEFT JOIN users u ON u.id = o.utilisateur_id
      WHERE o.id = $1
      `,
      [req.params.id]
    );

    const itemsResult = await query(
      `
      SELECT oi.quantite, oi.prix_unitaire, p.nom
      FROM order_items oi
      JOIN products p ON p.id = oi.produit_id
      WHERE oi.commande_id = $1
      `,
      [req.params.id]
    );

    return res.json({ order: orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    return next(error);
  }
}
