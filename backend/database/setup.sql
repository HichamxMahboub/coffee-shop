-- Base de données Coffee Shop : schéma minimal pour la production

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  unit VARCHAR(10) NOT NULL CHECK (unit IN ('ml', 'g', 'unit')),
  stock_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  alert_threshold NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  quantity_needed NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(120) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value)
VALUES ('currency_symbol', '€'), ('currency_position', 'suffix')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'cash';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id INTEGER;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(10, 2);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS card_amount NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_product_ingredients_product
  ON product_ingredients (product_id);

CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient
  ON product_ingredients (ingredient_id);
