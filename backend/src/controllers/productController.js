import { z } from "zod";
import { query } from "../db.js";

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  categoryId: z.number().int().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
});

// Liste des produits avec recherche et catégories
export async function getProducts(req, res, next) {
  try {
    const { q } = req.query;
    const params = [];

    let sql = `
      SELECT p.id, p.nom AS name, p.prix AS price, p.image_url,
             c.id AS category_id, c.nom AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.categorie_id
    `;

    if (q) {
      params.push(`%${q}%`);
      sql += " WHERE p.nom ILIKE $1";
    }

    sql += " ORDER BY p.nom";

    const result = await query(sql, params);
    const products = result.rows.map((row) => ({
      ...row,
      price: Number(row.price),
    }));
    return res.json(products);
  } catch (error) {
    return next(error);
  }
}

// Détails d'un produit
export async function getProduct(req, res, next) {
  try {
    const result = await query(
      `
            SELECT p.id, p.nom AS name, p.prix AS price, p.image_url,
              c.id AS category_id, c.nom AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.categorie_id
      WHERE p.id = $1
      `,
      [req.params.id]
    );

    const product = result.rows[0]
      ? { ...result.rows[0], price: Number(result.rows[0].price) }
      : null;
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

// Création d'un produit
export async function createProduct(req, res, next) {
  try {
    const { name, price, categoryId, imageUrl } = productSchema.parse(req.body);

    const result = await query(
      `
      INSERT INTO products (nom, prix, categorie_id, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, price, categoryId || null, imageUrl || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

// Mise à jour d'un produit
export async function updateProduct(req, res, next) {
  try {
    const { name, price, categoryId, imageUrl } = productSchema.parse(req.body);

    const result = await query(
      `
      UPDATE products
      SET nom = $1, prix = $2, categorie_id = $3, image_url = $4
      WHERE id = $5
      RETURNING *
      `,
      [name, price, categoryId || null, imageUrl || null, req.params.id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}

// Suppression d'un produit
export async function deleteProduct(req, res, next) {
  try {
    await query("DELETE FROM products WHERE id = $1", [req.params.id]);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides" });
    }
    return next(error);
  }
}
