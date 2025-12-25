-- Stock Adjustments Table
-- Tracks all inventory quantity changes with audit trail

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  quantity_delta INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'received', 'damaged', 'returned', 'cycle_count', 
    'theft', 'expired', 'transfer_out', 'transfer_in', 
    'initial_stock', 'other'
  )),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_item ON stock_adjustments(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_at ON stock_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_reason ON stock_adjustments(reason);

-- Enable Row Level Security
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all adjustments
CREATE POLICY "Users can view stock adjustments"
  ON stock_adjustments FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert adjustments
CREATE POLICY "Users can create stock adjustments"
  ON stock_adjustments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: No UPDATE or DELETE policies = immutable audit trail
-- Adjustments cannot be modified or deleted after creation

COMMENT ON TABLE stock_adjustments IS 'Immutable audit trail of all inventory quantity changes';
COMMENT ON COLUMN stock_adjustments.quantity_delta IS 'Change in quantity (positive for additions, negative for reductions)';
COMMENT ON COLUMN stock_adjustments.quantity_before IS 'Item quantity before this adjustment';
COMMENT ON COLUMN stock_adjustments.quantity_after IS 'Item quantity after this adjustment (quantity_before + quantity_delta)';
COMMENT ON COLUMN stock_adjustments.reason IS 'Categorized reason for the adjustment';
