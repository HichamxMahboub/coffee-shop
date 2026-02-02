import { query } from "../db.js";

export async function getZReport(req, res, next) {
  try {
    const totalResult = await query(
      `
      SELECT COALESCE(SUM(total), 0) AS total_sales
      FROM orders
      WHERE created_at::date = CURRENT_DATE
      `
    );

    const paymentResult = await query(
      `
      SELECT payment_method, COALESCE(SUM(total), 0) AS total
      FROM orders
      WHERE created_at::date = CURRENT_DATE
      GROUP BY payment_method
      `
    );

    const coffeeCount = await query(
      `
      SELECT COALESCE(SUM(oi.quantite), 0) AS count
      FROM order_items oi
      JOIN products p ON p.id = oi.produit_id
      JOIN categories c ON c.id = p.categorie_id
      WHERE c.nom = 'Café'
        AND oi.commande_id IN (
          SELECT id FROM orders WHERE created_at::date = CURRENT_DATE
        )
      `
    );

    const byPayment = paymentResult.rows.reduce((acc, row) => {
      acc[row.payment_method] = Number(row.total);
      return acc;
    }, {});

    return res.json({
      date: new Date().toISOString().slice(0, 10),
      totalSales: Number(totalResult.rows[0].total_sales),
      byPayment,
      coffeesSold: Number(coffeeCount.rows[0].count),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getZReportItems(req, res, next) {
  try {
    const settingsResult = await query(
      "SELECT key, value FROM settings WHERE key = 'tax_rate'"
    );
    const taxRate = Number(settingsResult.rows[0]?.value ?? 0.2);

    const itemsResult = await query(
      `
      SELECT p.nom AS name,
             SUM(oi.quantite) AS quantity,
             SUM(oi.quantite * oi.prix_unitaire) AS total_ht
      FROM order_items oi
      JOIN products p ON p.id = oi.produit_id
      JOIN orders o ON o.id = oi.commande_id
      WHERE o.created_at::date = CURRENT_DATE
      GROUP BY p.nom
      ORDER BY total_ht DESC
      `
    );

    const items = itemsResult.rows.map((row) => {
      const totalHt = Number(row.total_ht || 0);
      const totalTtc = totalHt * (1 + taxRate);
      return {
        name: row.name,
        quantity: Number(row.quantity || 0),
        totalHt,
        totalTtc,
      };
    });

    const totalVat = items.reduce(
      (sum, item) => sum + (item.totalTtc - item.totalHt),
      0
    );

    return res.json({ items, totalVat });
  } catch (error) {
    return next(error);
  }
}

export async function getZReportIngredients(req, res, next) {
  try {
    const result = await query(
      `
      SELECT i.name AS name,
             i.unit AS unit,
             COALESCE(SUM(oi.quantite * pi.quantity_needed), 0) AS quantity_used
      FROM order_items oi
      JOIN orders o ON o.id = oi.commande_id
      JOIN product_ingredients pi ON pi.product_id = oi.produit_id
      JOIN ingredients i ON i.id = pi.ingredient_id
      WHERE o.created_at::date = CURRENT_DATE
      GROUP BY i.id, i.name, i.unit
      ORDER BY quantity_used DESC
      `
    );

    const ingredients = result.rows.map((row) => ({
      name: row.name,
      unit: row.unit,
      quantityUsed: Number(row.quantity_used || 0),
    }));

    return res.json({ ingredients });
  } catch (error) {
    return next(error);
  }
}
