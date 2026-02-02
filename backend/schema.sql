-- Schéma PostgreSQL complet Coffee Shop POS

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  name_en VARCHAR(120),
  name_es VARCHAR(120),
  name_ar VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(160) NOT NULL,
  name_en VARCHAR(160),
  name_es VARCHAR(160),
  name_ar VARCHAR(160),
  prix NUMERIC(10, 2) NOT NULL,
  categorie_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  unit VARCHAR(10) NOT NULL CHECK (unit IN ('ml', 'g', 'unit')),
  stock_quantity NUMERIC(12, 3) NOT NULL,
  alert_threshold NUMERIC(12, 3) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_needed NUMERIC(12, 3) NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(120) PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  total NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL DEFAULT 'cash',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  cash_amount NUMERIC(10, 2),
  card_amount NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  commande_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  produit_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(10, 2) NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
