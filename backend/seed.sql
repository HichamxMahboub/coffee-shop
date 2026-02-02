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

INSERT INTO ingredients (nom, quantite, unite, seuil_alerte) VALUES
  ('Grains Arabica', 5000, 'grammes', 500),
  ('Lait', 20, 'litres', 2),
  ('Sucre', 2000, 'grammes', 200)
ON CONFLICT DO NOTHING;

-- Liaison produits -> ingrédients (déstockage automatique)
-- Cappuccino: 8g grains, 0.20L lait
INSERT INTO product_ingredients (product_id, ingredient_id, quantite_par_unite) VALUES
  (1, 1, 8),
  (1, 2, 0.20),
  (2, 1, 7),
  (3, 1, 3)
ON CONFLICT DO NOTHING;
