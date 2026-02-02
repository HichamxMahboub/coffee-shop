import { query } from "../db.js";

export async function getPendingOrders(req, res, next) {
  try {
    const ordersResult = await query(
      `
      SELECT o.id, o.created_at, o.total, o.payment_method
      FROM orders o
      WHERE o.status = 'pending'
      ORDER BY o.created_at ASC
      `
    );

    const itemsResult = await query(
      `
      SELECT oi.commande_id, p.nom AS name, oi.quantite, oi.notes
      FROM order_items oi
      JOIN products p ON p.id = oi.produit_id
      WHERE oi.commande_id = ANY($1)
      `,
      [ordersResult.rows.map((row) => row.id)]
    );

    const itemsByOrder = itemsResult.rows.reduce((acc, item) => {
      acc[item.commande_id] = acc[item.commande_id] || [];
      acc[item.commande_id].push({
        name: item.name,
        quantity: item.quantite,
        notes: item.notes,
      });
      return acc;
    }, {});

    const orders = ordersResult.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      total: Number(row.total),
      paymentMethod: row.payment_method,
      items: itemsByOrder[row.id] || [],
    }));

    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}
