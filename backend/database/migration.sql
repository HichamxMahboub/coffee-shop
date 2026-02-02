-- Migration: Produits/Variantes, Ingrédients/Recettes, Paramètres

BEGIN;

-- Categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name VARCHAR(120);
UPDATE categories SET name = nom WHERE name IS NULL AND nom IS NOT NULL;

-- Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(160);
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE products SET name = nom WHERE name IS NULL AND nom IS NOT NULL;

-- Product variants
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL CHECK (size IN ('S', 'M', 'L')),
  price NUMERIC(10, 2) NOT NULL,
  sku VARCHAR(64),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_product_size
  ON product_variants (product_id, size);

-- Ingredients (ensure columns exist)
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS unit VARCHAR(10) NOT NULL DEFAULT 'g';
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS stock_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS alert_threshold NUMERIC(12, 3) NOT NULL DEFAULT 0;

-- Recipe items (variant -> ingredient)
CREATE TABLE IF NOT EXISTS recipe_items (
  id SERIAL PRIMARY KEY,
  product_variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_needed NUMERIC(12, 3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_items_variant_ingredient
  ON recipe_items (product_variant_id, ingredient_id);

-- Settings (currency, tax, cafe info)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(120) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value)
VALUES
  ('currency_symbol', '€'),
  ('currency_position', 'suffix'),
  ('tax_rate', '0.20'),
  ('cafe_name', 'Café Premium'),
  ('cafe_address', '')
ON CONFLICT (key) DO NOTHING;

COMMIT;
