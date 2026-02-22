-- ============================================
-- PART RESERVATIONS MIGRATION
-- Run this in Supabase SQL Editor to enable part reservations
-- ============================================

-- ============================================
-- 1. Create reservation_status enum if not exists
-- ============================================
DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'fulfilled', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. Create part_reservations table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS part_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  quantity_reserved INTEGER NOT NULL CHECK (quantity_reserved > 0),
  status reservation_status NOT NULL DEFAULT 'pending',
  reserved_by UUID REFERENCES auth.users(id),
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_part_reservations_work_order ON part_reservations(work_order_id);
CREATE INDEX IF NOT EXISTS idx_part_reservations_inventory_item ON part_reservations(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_part_reservations_status ON part_reservations(status);
CREATE INDEX IF NOT EXISTS idx_part_reservations_expires_at ON part_reservations(expires_at) WHERE status = 'pending';

-- ============================================
-- 4. Enable RLS
-- ============================================
ALTER TABLE part_reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view part reservations" ON part_reservations;
DROP POLICY IF EXISTS "Allow authenticated users to insert part reservations" ON part_reservations;
DROP POLICY IF EXISTS "Allow authenticated users to update part reservations" ON part_reservations;
DROP POLICY IF EXISTS "Allow authenticated users to delete part reservations" ON part_reservations;

-- Create policies
CREATE POLICY "Allow authenticated users to view part reservations"
  ON part_reservations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert part reservations"
  ON part_reservations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update part reservations"
  ON part_reservations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete part reservations"
  ON part_reservations FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 5. Create update trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_part_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_part_reservations_updated_at ON part_reservations;
CREATE TRIGGER trigger_part_reservations_updated_at
  BEFORE UPDATE ON part_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_part_reservations_updated_at();

-- ============================================
-- 6. Create reserve_part_for_work_order function
-- ============================================
CREATE OR REPLACE FUNCTION reserve_part_for_work_order(
  p_work_order_id UUID,
  p_inventory_item_id UUID,
  p_quantity INTEGER,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_available_qty INTEGER;
  v_reserved_qty INTEGER;
  v_reservation_id UUID;
BEGIN
  -- Get current inventory quantity
  SELECT quantity_on_hand INTO v_available_qty
  FROM inventory_items 
  WHERE id = p_inventory_item_id;
  
  IF v_available_qty IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  -- Get total reserved quantity for this item
  SELECT COALESCE(SUM(quantity_reserved), 0) INTO v_reserved_qty
  FROM part_reservations
  WHERE inventory_item_id = p_inventory_item_id
    AND status IN ('pending', 'confirmed');
  
  -- Check if enough available (on hand minus reserved)
  IF (v_available_qty - v_reserved_qty) < p_quantity THEN
    RAISE EXCEPTION 'Insufficient available inventory. On hand: %, Reserved: %, Requested: %', 
      v_available_qty, v_reserved_qty, p_quantity;
  END IF;
  
  -- Create reservation
  INSERT INTO part_reservations (
    work_order_id,
    inventory_item_id,
    quantity_reserved,
    status,
    reserved_by,
    expires_at,
    notes
  )
  VALUES (
    p_work_order_id,
    p_inventory_item_id,
    p_quantity,
    'pending',
    p_user_id,
    COALESCE(p_expires_at, NOW() + INTERVAL '7 days'),
    p_notes
  )
  RETURNING id INTO v_reservation_id;
  
  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Create fulfill_part_reservation function
-- ============================================
CREATE OR REPLACE FUNCTION fulfill_part_reservation(
  p_reservation_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_reservation RECORD;
  v_part_id UUID;
BEGIN
  -- Get reservation details
  SELECT * INTO v_reservation
  FROM part_reservations
  WHERE id = p_reservation_id
    AND status IN ('pending', 'confirmed')
  FOR UPDATE;
  
  IF v_reservation IS NULL THEN
    RAISE EXCEPTION 'Reservation not found or already processed';
  END IF;
  
  -- Add part to work order (this also deducts inventory)
  v_part_id := add_part_to_work_order(
    v_reservation.work_order_id,
    v_reservation.inventory_item_id,
    v_reservation.quantity_reserved,
    'Fulfilled from reservation ' || p_reservation_id,
    p_user_id
  );
  
  -- Update reservation status
  UPDATE part_reservations
  SET status = 'fulfilled',
      fulfilled_at = NOW()
  WHERE id = p_reservation_id;
  
  RETURN v_part_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Create cancel_part_reservation function
-- ============================================
CREATE OR REPLACE FUNCTION cancel_part_reservation(
  p_reservation_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE part_reservations
  SET status = 'cancelled',
      cancelled_at = NOW(),
      notes = COALESCE(notes || ' | Cancelled: ' || p_reason, 'Cancelled: ' || p_reason)
  WHERE id = p_reservation_id
    AND status IN ('pending', 'confirmed');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Create get_available_inventory_quantity function
-- ============================================
CREATE OR REPLACE FUNCTION get_available_inventory_quantity(p_inventory_item_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_on_hand INTEGER;
  v_reserved INTEGER;
BEGIN
  SELECT quantity_on_hand INTO v_on_hand
  FROM inventory_items
  WHERE id = p_inventory_item_id;
  
  SELECT COALESCE(SUM(quantity_reserved), 0) INTO v_reserved
  FROM part_reservations
  WHERE inventory_item_id = p_inventory_item_id
    AND status IN ('pending', 'confirmed');
  
  RETURN COALESCE(v_on_hand, 0) - v_reserved;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 10. Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION reserve_part_for_work_order TO authenticated;
GRANT EXECUTE ON FUNCTION fulfill_part_reservation TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_part_reservation TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_inventory_quantity TO authenticated;
