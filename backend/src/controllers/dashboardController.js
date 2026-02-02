import { query } from "../db.js";

// Résumé des ventes du jour, nombre de commandes et alertes stock bas
export async function getDashboard(req, res, next) {
  try {
    const salesResult = await query(
      `
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_sales,
        COUNT(*) AS total_orders
      FROM orders
      WHERE created_at::date = CURRENT_DATE
      `
    );

    const lowStockResult = await query(
      `
      SELECT id, name, stock, low_stock_threshold
      FROM products
      WHERE stock <= low_stock_threshold
      ORDER BY stock ASC
      LIMIT 10
      `
    );

    return res.json({
      todaySales: Number(salesResult.rows[0].total_sales),
      todayOrders: Number(salesResult.rows[0].total_orders),
      lowStock: lowStockResult.rows,
    });
  } catch (error) {
    return next(error);
  }
}
