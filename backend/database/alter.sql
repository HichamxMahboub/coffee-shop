-- Migration pour rendre le prototype "incassable"

-- 1) Table settings (key/value)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(120) PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2) Orders : status + multi-paiement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='status'
  ) THEN
    ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='cash_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN cash_amount NUMERIC(10,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='card_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN card_amount NUMERIC(10,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'orders'::regclass AND contype = 'c' AND conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'completed', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'orders'::regclass AND contype = 'c' AND conname = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
      CHECK (payment_method IN ('cash', 'card', 'mixed'));
  END IF;
END $$;

-- 3) order_items : notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='order_items' AND column_name='notes'
  ) THEN
    ALTER TABLE order_items ADD COLUMN notes TEXT;
  END IF;
END $$;

-- 4) Devise + traductions
-- Currency settings stored as keys in settings table
INSERT INTO settings (key, value)
VALUES ('currency_symbol', '€'), ('currency_position', 'suffix')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en VARCHAR(120);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_es VARCHAR(120);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(120);

ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en VARCHAR(160);
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_es VARCHAR(160);
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_ar VARCHAR(160);
