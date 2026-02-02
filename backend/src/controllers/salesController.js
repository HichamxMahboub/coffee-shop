import { query } from "../db.js";

// Historique filtrable des ventes
export async function getSalesHistory(req, res, next) {
  try {
    const { from, to } = req.query;
    const params = [];
    let sql = `
      SELECT o.id, o.created_at, o.subtotal, o.tax_amount, o.total_amount, o.payment_method,
             u.full_name AS cashier
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
    `;

    if (from && to) {
      params.push(from, to);
      sql += " WHERE o.created_at BETWEEN $1 AND $2";
    }

    sql += " ORDER BY o.created_at DESC";

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

// Export CSV simple
export async function exportSalesCsv(req, res, next) {
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

    const header = "id,date,subtotal,tva,total,paiement,caissier";
    const rows = result.rows.map((row) =>
      [
        row.id,
        row.created_at.toISOString(),
        row.subtotal,
        row.tax_amount,
        row.total_amount,
        row.payment_method,
        row.cashier || "",
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ventes.csv");
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
}
