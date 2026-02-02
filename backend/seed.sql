-- Données de test

INSERT INTO categories (nom) VALUES
  ('Café'),
  ('Thé'),
  ('Pâtisseries')
ON CONFLICT DO NOTHING;

INSERT INTO products (nom, prix, categorie_id, image_url) VALUES
  ('Cappuccino', 3.50, 1, NULL),
  ('Espresso', 2.20, 1, NULL),
  ('Thé Vert', 2.80, 2, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (name, unit, stock_quantity, alert_threshold) VALUES
  ('Grains Arabica', 'g', 5000, 500),
  ('Lait', 'ml', 20000, 2000),
  ('Sucre', 'g', 2000, 200)
ON CONFLICT DO NOTHING;

-- Liaison produits -> ingrédients (déstockage automatique)
-- Cappuccino: 8g grains, 0.20L lait
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
  (1, 1, 8),
  (1, 2, 200),
  (2, 1, 7),
  (3, 1, 3)
ON CONFLICT DO NOTHING;
