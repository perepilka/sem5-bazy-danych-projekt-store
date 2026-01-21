-- Add stock threshold columns to Products table for restock suggestions feature
ALTER TABLE Products ADD COLUMN low_stock_threshold INT DEFAULT 10;
ALTER TABLE Products ADD COLUMN minimum_stock INT DEFAULT 20;

-- Update existing products to have default values
UPDATE Products SET low_stock_threshold = 10 WHERE low_stock_threshold IS NULL;
UPDATE Products SET minimum_stock = 20 WHERE minimum_stock IS NULL;
