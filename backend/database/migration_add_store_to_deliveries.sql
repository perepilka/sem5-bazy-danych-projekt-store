-- Migration: Add store_id to Deliveries table
-- This allows tracking which store each delivery is for

ALTER TABLE Deliveries ADD COLUMN IF NOT EXISTS store_id INT REFERENCES Stores(store_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deliveries_store_id ON Deliveries(store_id);

-- Note: Existing deliveries will have NULL store_id
-- They should be manually assigned to a store before changing status to ZREALIZOWANA
