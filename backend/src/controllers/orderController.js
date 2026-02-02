import { query, pool } from "../db.js";

// Création d'une commande (POS)
export async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const { items, paymentMethod, taxRate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Le panier est vide" });
    }

    await client.query("BEGIN");

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate || 0.2);
    const totalAmount = subtotal + taxAmount;

    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, subtotal, tax_amount, total_amount, payment_method)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [req.user.id, subtotal, taxAmount, totalAmount, paymentMethod || "cash"]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.productId, item.quantity, item.unitPrice]
      );

      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.productId]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({ id: orderId, subtotal, taxAmount, totalAmount });
  } catch (error) {
    await client.query("ROLLBACK");
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
      SELECT o.id, o.created_at, o.subtotal, o.tax_amount, o.total_amount, o.payment_method,
             u.full_name AS cashier
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
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
      SELECT o.id, o.created_at, o.subtotal, o.tax_amount, o.total_amount, o.payment_method,
             u.full_name AS cashier
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = $1
      `,
      [req.params.id]
    );

    const itemsResult = await query(
      `
      SELECT oi.quantity, oi.unit_price, p.name
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      `,
      [req.params.id]
    );

    return res.json({ order: orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    return next(error);
  }
}
