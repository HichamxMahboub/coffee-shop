import { query } from "../db.js";

// Liste des produits avec recherche et catégories
export async function getProducts(req, res, next) {
  try {
    const { q } = req.query;
    const params = [];

    let sql = `
      SELECT p.id, p.name, p.price, p.stock, p.low_stock_threshold,
             c.id AS category_id, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
    `;

    if (q) {
      params.push(`%${q}%`);
      sql += " WHERE p.name ILIKE $1";
    }

    sql += " ORDER BY p.name";

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

// Détails d'un produit
export async function getProduct(req, res, next) {
  try {
    const result = await query(
      `
      SELECT p.id, p.name, p.price, p.stock, p.low_stock_threshold,
             c.id AS category_id, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
      `,
      [req.params.id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

// Création d'un produit
export async function createProduct(req, res, next) {
  try {
    const { name, price, stock, categoryId, lowStockThreshold } = req.body;

    const result = await query(
      `
      INSERT INTO products (name, price, stock, category_id, low_stock_threshold)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, price, stock, categoryId || null, lowStockThreshold || 5]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

// Mise à jour d'un produit
export async function updateProduct(req, res, next) {
  try {
    const { name, price, stock, categoryId, lowStockThreshold } = req.body;

    const result = await query(
      `
      UPDATE products
      SET name = $1, price = $2, stock = $3, category_id = $4, low_stock_threshold = $5
      WHERE id = $6
      RETURNING *
      `,
      [name, price, stock, categoryId || null, lowStockThreshold || 5, req.params.id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

// Suppression d'un produit
export async function deleteProduct(req, res, next) {
  try {
    await query("DELETE FROM products WHERE id = $1", [req.params.id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
