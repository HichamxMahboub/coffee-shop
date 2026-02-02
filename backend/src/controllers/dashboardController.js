import { query } from "../db.js";

// Résumé des ventes du jour, nombre de commandes et alertes stock bas
export async function getDashboard(req, res, next) {
  try {
    const salesResult = await query(
      `
      SELECT
        COALESCE(SUM(total), 0) AS total_sales,
        COUNT(*) AS total_orders
      FROM orders
      WHERE created_at::date = CURRENT_DATE
      `
    );

    const lowStockResult = await query(
      `
      SELECT id, name, stock_quantity, alert_threshold, unit
      FROM ingredients
      WHERE stock_quantity <= alert_threshold
      ORDER BY stock_quantity ASC
      LIMIT 10
      `
    );

    const revenueByDay = await query(
      `
      SELECT to_char(created_at::date, 'YYYY-MM-DD') AS day,
             SUM(total) AS total
      FROM orders
      GROUP BY created_at::date
      ORDER BY created_at::date DESC
      LIMIT 7
      `
    );

    const topProducts = await query(
      `
      SELECT p.nom AS name, SUM(oi.quantite) AS quantity
      FROM order_items oi
      JOIN products p ON p.id = oi.produit_id
      GROUP BY p.nom
      ORDER BY quantity DESC
      LIMIT 5
      `
    );

    const lowStock = lowStockResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      stock: Number(row.stock_quantity),
      threshold: Number(row.alert_threshold),
      unit: row.unit,
    }));

    return res.json({
      todaySales: Number(salesResult.rows[0].total_sales),
      todayOrders: Number(salesResult.rows[0].total_orders),
      lowStock,
      revenueByDay: revenueByDay.rows
        .map((row) => ({ day: row.day, total: Number(row.total) }))
        .reverse(),
      topProducts: topProducts.rows.map((row) => ({
        name: row.name,
        quantity: Number(row.quantity),
      })),
    });
  } catch (error) {
    return next(error);
  }
}
