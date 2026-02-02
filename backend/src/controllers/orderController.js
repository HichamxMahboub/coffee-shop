import { z } from "zod";
import { query, pool } from "../db.js";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int(),
        productVariantId: z.number().int().optional().nullable(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        notes: z.string().max(280).optional().nullable(),
      })
    )
    .min(1),
  paymentMethod: z.string().min(1).optional(),
  customerId: z.number().int().optional().nullable(),
  cashAmount: z.number().nonnegative().optional().nullable(),
  cardAmount: z.number().nonnegative().optional().nullable(),
});

// Création d'une commande (POS)
export async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const { items, paymentMethod, customerId, cashAmount, cardAmount } =
      orderSchema.parse(req.body);

    await client.query("BEGIN");

    const settingsResult = await client.query(
      "SELECT value FROM settings WHERE key = 'tax_rate'"
    );
    const taxRate = Number(settingsResult.rows[0]?.value ?? 0.2);

    // Calcul du total
    const totalHt = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    let total = totalHt * (1 + taxRate);

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

    // Calcul des ingrédients requis par produit
    const requiredByIngredient = new Map();

    for (const item of items) {
      let variantId = item.productVariantId || null;
      let productId = item.productId;

      if (!variantId) {
        const variantResult = await client.query(
          `
          SELECT id
          FROM product_variants
          WHERE product_id = $1
          ORDER BY (size = 'M') DESC, (size = 'S') DESC, id ASC
          LIMIT 1
          `,
          [productId]
        );
        variantId = variantResult.rows[0]?.id || null;
      }

      if (!variantId) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Aucune variante trouvée pour ce produit",
        });
      }

      const recipeResult = await client.query(
        `
        SELECT ingredient_id, quantity_needed
        FROM recipe_items
        WHERE product_variant_id = $1
        `,
        [variantId]
      );

      if (recipeResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Aucune recette définie pour cette variante",
        });
      }

      for (const row of recipeResult.rows) {
        const required = Number(row.quantity_needed) * item.quantity;
        const current = requiredByIngredient.get(row.ingredient_id) || 0;
        requiredByIngredient.set(row.ingredient_id, current + required);
      }
    }

    // Vérification du stock d'ingrédients
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

    // Enregistrement de la commande
    const finalPaymentMethod = paymentMethod || "cash";

    if (finalPaymentMethod === "mixed") {
      if (cashAmount == null || cardAmount == null) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Montants cash/carte requis" });
      }

      const mixedTotal = Number(cashAmount) + Number(cardAmount);
      if (Math.abs(mixedTotal - total) > 0.01) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Montants invalides" });
      }
    }

    const orderResult = await client.query(
      `
      INSERT INTO orders (utilisateur_id, customer_id, total, payment_method, status, cash_amount, card_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        req.user.id,
        customerId || null,
        total,
        finalPaymentMethod,
        "pending",
        finalPaymentMethod === "cash" ? total : cashAmount || null,
        finalPaymentMethod === "card" ? total : cardAmount || null,
      ]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (commande_id, produit_id, quantite, prix_unitaire, notes)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [orderId, item.productId, item.quantity, item.unitPrice, item.notes || null]
      );
    }

    // Déstockage des ingrédients
    for (const [ingredientId, required] of requiredByIngredient.entries()) {
      await client.query(
        "UPDATE ingredients SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [required, ingredientId]
      );
    }

    // Mise à jour des points fidélité
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
      status: "pending",
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
      SELECT oi.quantite, oi.prix_unitaire, oi.notes, p.nom
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
