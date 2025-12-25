-- Inventory Transactions Enhancement
-- Adds support for stock receipts, transfers, cycle counts, and shrinkage tracking

-- Stock Receipts Table
-- Tracks incoming stock from suppliers with PO/invoice references
CREATE TABLE IF NOT EXISTS stock_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  po_number TEXT,
  invoice_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'complete', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Receipt Line Items
CREATE TABLE IF NOT EXISTS stock_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES stock_receipts(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_expected INTEGER NOT NULL DEFAULT 0,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Transfers Table
-- Tracks movement of inventory between locations
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number TEXT NOT NULL UNIQUE,
  from_warehouse TEXT NOT NULL,
  to_warehouse TEXT NOT NULL,
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'complete', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Transfer Line Items
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cycle Counts Table
-- Tracks inventory count sessions
CREATE TABLE IF NOT EXISTS cycle_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_number TEXT NOT NULL UNIQUE,
  count_date DATE NOT NULL DEFAULT CURRENT_DATE,
  warehouse TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'pending_review', 'complete', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cycle Count Line Items
CREATE TABLE IF NOT EXISTS cycle_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_count_id UUID NOT NULL REFERENCES cycle_counts(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  system_quantity INTEGER NOT NULL,
  counted_quantity INTEGER,
  variance INTEGER GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - system_quantity) STORED,
  counted_by UUID REFERENCES auth.users(id),
  counted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shrinkage Records Table
-- Dedicated tracking for inventory losses
CREATE TABLE IF NOT EXISTS shrinkage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_lost INTEGER NOT NULL,
  loss_type TEXT NOT NULL CHECK (loss_type IN ('theft', 'damage', 'expired', 'spoilage', 'unknown', 'other')),
  discovered_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_value DECIMAL(10,2),
  notes TEXT,
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_stock_receipts_supplier ON stock_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_receipts_date ON stock_receipts(received_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_receipts_status ON stock_receipts(status);
CREATE INDEX IF NOT EXISTS idx_stock_receipt_items_receipt ON stock_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_stock_receipt_items_item ON stock_receipt_items(inventory_item_id);

CREATE INDEX IF NOT EXISTS idx_stock_transfers_date ON stock_transfers(transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_status ON stock_transfers(status);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_items_transfer ON stock_transfer_items(transfer_id);

CREATE INDEX IF NOT EXISTS idx_cycle_counts_date ON cycle_counts(count_date DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_status ON cycle_counts(status);
CREATE INDEX IF NOT EXISTS idx_cycle_count_items_count ON cycle_count_items(cycle_count_id);

CREATE INDEX IF NOT EXISTS idx_shrinkage_records_item ON shrinkage_records(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_shrinkage_records_date ON shrinkage_records(discovered_date DESC);
CREATE INDEX IF NOT EXISTS idx_shrinkage_records_type ON shrinkage_records(loss_type);

-- Enable Row Level Security
ALTER TABLE stock_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shrinkage_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_receipts
CREATE POLICY "Users can view stock receipts" ON stock_receipts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create stock receipts" ON stock_receipts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update stock receipts" ON stock_receipts FOR UPDATE TO authenticated USING (true);

-- RLS Policies for stock_receipt_items
CREATE POLICY "Users can view stock receipt items" ON stock_receipt_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create stock receipt items" ON stock_receipt_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update stock receipt items" ON stock_receipt_items FOR UPDATE TO authenticated USING (true);

-- RLS Policies for stock_transfers
CREATE POLICY "Users can view stock transfers" ON stock_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create stock transfers" ON stock_transfers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update stock transfers" ON stock_transfers FOR UPDATE TO authenticated USING (true);

-- RLS Policies for stock_transfer_items
CREATE POLICY "Users can view stock transfer items" ON stock_transfer_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create stock transfer items" ON stock_transfer_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update stock transfer items" ON stock_transfer_items FOR UPDATE TO authenticated USING (true);

-- RLS Policies for cycle_counts
CREATE POLICY "Users can view cycle counts" ON cycle_counts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create cycle counts" ON cycle_counts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update cycle counts" ON cycle_counts FOR UPDATE TO authenticated USING (true);

-- RLS Policies for cycle_count_items
CREATE POLICY "Users can view cycle count items" ON cycle_count_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create cycle count items" ON cycle_count_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update cycle count items" ON cycle_count_items FOR UPDATE TO authenticated USING (true);

-- RLS Policies for shrinkage_records
CREATE POLICY "Users can view shrinkage records" ON shrinkage_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create shrinkage records" ON shrinkage_records FOR INSERT TO authenticated WITH CHECK (true);

-- Functions to generate sequential numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM stock_receipts
  WHERE receipt_number ~ '^RCP[0-9]+$';
  RETURN 'RCP' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transfer_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM stock_transfers
  WHERE transfer_number ~ '^TRF[0-9]+$';
  RETURN 'TRF' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_count_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(count_number FROM 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM cycle_counts
  WHERE count_number ~ '^CC[0-9]+$';
  RETURN 'CC' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE stock_receipts IS 'Tracks incoming inventory from suppliers';
COMMENT ON TABLE stock_transfers IS 'Tracks inventory movement between warehouse locations';
COMMENT ON TABLE cycle_counts IS 'Tracks inventory count sessions for accuracy verification';
COMMENT ON TABLE shrinkage_records IS 'Tracks inventory losses due to theft, damage, expiration, etc.';
