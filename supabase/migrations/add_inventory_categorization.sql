-- Inventory Categorization & Organization
-- Adds suppliers table and extends inventory_items with categories, location, and units

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on supplier name
CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(LOWER(name));

-- RLS for suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suppliers"
  ON suppliers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert suppliers"
  ON suppliers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update suppliers"
  ON suppliers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete suppliers"
  ON suppliers FOR DELETE TO authenticated USING (true);

-- Add new columns to inventory_items
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_of_measure TEXT NOT NULL DEFAULT 'each',
  ADD COLUMN IF NOT EXISTS units_per_package INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS warehouse TEXT,
  ADD COLUMN IF NOT EXISTS zone TEXT,
  ADD COLUMN IF NOT EXISTS aisle TEXT,
  ADD COLUMN IF NOT EXISTS bin TEXT,
  ADD COLUMN IF NOT EXISTS shelf TEXT;

-- Indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_warehouse ON inventory_items(warehouse);
CREATE INDEX IF NOT EXISTS idx_inventory_items_categories ON inventory_items USING GIN(categories);

-- Add constraint for units_per_package
ALTER TABLE inventory_items
  ADD CONSTRAINT chk_units_per_package CHECK (units_per_package >= 1);

-- Add constraint for valid unit_of_measure
ALTER TABLE inventory_items
  ADD CONSTRAINT chk_unit_of_measure CHECK (unit_of_measure IN (
    'each', 'pair', 'box', 'case', 'pack', 'roll', 'gallon', 'liter', 'pound', 'kilogram'
  ));

-- Comments
COMMENT ON TABLE suppliers IS 'Vendors and suppliers for inventory items';
COMMENT ON COLUMN inventory_items.categories IS 'Array of category tags for the item';
COMMENT ON COLUMN inventory_items.unit_of_measure IS 'Unit used for counting this item';
COMMENT ON COLUMN inventory_items.units_per_package IS 'Number of base units per package (conversion factor)';
COMMENT ON COLUMN inventory_items.warehouse IS 'Warehouse where item is stored';
COMMENT ON COLUMN inventory_items.zone IS 'Zone within warehouse';
COMMENT ON COLUMN inventory_items.aisle IS 'Aisle identifier';
COMMENT ON COLUMN inventory_items.bin IS 'Bin identifier';
COMMENT ON COLUMN inventory_items.shelf IS 'Shelf identifier';
