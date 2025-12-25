-- Work Order Parts Integration Migration
-- Enables tracking parts used on work orders, reservations, and auto-deduction

-- ============================================
-- 1. WORK ORDER PARTS TABLE
-- Tracks parts actually used on work orders
-- ============================================

CREATE TABLE IF NOT EXISTS work_order_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_used * unit_cost) STORED,
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for work_order_parts
CREATE INDEX IF NOT EXISTS idx_work_order_parts_work_order ON work_order_parts(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_parts_inventory_item ON work_order_parts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_work_order_parts_created_at ON work_order_parts(created_at);

-- ============================================
-- 2. PART RESERVATIONS TABLE
-- Tracks parts reserved for upcoming work orders
-- ============================================

CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'fulfilled', 'cancelled', 'expired');

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

-- Indexes for part_reservations
CREATE INDEX IF NOT EXISTS idx_part_reservations_work_order ON part_reservations(work_order_id);
CREATE INDEX IF NOT EXISTS idx_part_reservations_inventory_item ON part_reservations(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_part_reservations_status ON part_reservations(status);
CREATE INDEX IF NOT EXISTS idx_part_reservations_expires_at ON part_reservations(expires_at) WHERE status = 'pending';

-- ============================================
-- 3. PARTS USAGE ANALYTICS VIEW
-- Aggregated view for parts usage analytics
-- ============================================

CREATE OR REPLACE VIEW parts_usage_analytics AS
SELECT 
  wop.inventory_item_id,
  ii.name AS item_name,
  ii.sku,
  wo.vehicle_id,
  v.make || ' ' || v.model AS vehicle_name,
  wo.service_category_id,
  sc.name AS service_category_name,
  COUNT(DISTINCT wop.work_order_id) AS work_orders_count,
  SUM(wop.quantity_used) AS total_quantity_used,
  SUM(wop.total_cost) AS total_cost,
  AVG(wop.quantity_used) AS avg_quantity_per_order,
  MIN(wop.created_at) AS first_used_at,
  MAX(wop.created_at) AS last_used_at
FROM work_order_parts wop
JOIN inventory_items ii ON wop.inventory_item_id = ii.id
JOIN work_orders wo ON wop.work_order_id = wo.id
LEFT JOIN vehicles v ON wo.vehicle_id = v.id
LEFT JOIN service_categories sc ON wo.service_category_id = sc.id
GROUP BY 
  wop.inventory_item_id, 
  ii.name, 
  ii.sku,
  wo.vehicle_id, 
  v.make, 
  v.model,
  wo.service_category_id,
  sc.name;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE work_order_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_reservations ENABLE ROW LEVEL SECURITY;

-- Work Order Parts Policies
CREATE POLICY "Allow authenticated users to view work order parts"
  ON work_order_parts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert work order parts"
  ON work_order_parts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update work order parts"
  ON work_order_parts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete work order parts"
  ON work_order_parts FOR DELETE
  TO authenticated
  USING (true);

-- Part Reservations Policies
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
-- 5. TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Update timestamp trigger for work_order_parts
CREATE OR REPLACE FUNCTION update_work_order_parts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_order_parts_updated_at
  BEFORE UPDATE ON work_order_parts
  FOR EACH ROW
  EXECUTE FUNCTION update_work_order_parts_updated_at();

-- Update timestamp trigger for part_reservations
CREATE OR REPLACE FUNCTION update_part_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_part_reservations_updated_at
  BEFORE UPDATE ON part_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_part_reservations_updated_at();

-- ============================================
-- 6. FUNCTION: Add Part to Work Order with Auto-Deduction
-- ============================================

CREATE OR REPLACE FUNCTION add_part_to_work_order(
  p_work_order_id UUID,
  p_inventory_item_id UUID,
  p_quantity INTEGER,
  p_notes TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_current_qty INTEGER;
  v_unit_price DECIMAL(10,2);
  v_new_qty INTEGER;
  v_part_id UUID;
BEGIN
  -- Get current inventory quantity and price
  SELECT quantity_on_hand, unit_price 
  INTO v_current_qty, v_unit_price
  FROM inventory_items 
  WHERE id = p_inventory_item_id
  FOR UPDATE;
  
  IF v_current_qty IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  IF v_current_qty < p_quantity THEN
    RAISE EXCEPTION 'Insufficient inventory. Available: %, Requested: %', v_current_qty, p_quantity;
  END IF;
  
  -- Calculate new quantity
  v_new_qty := v_current_qty - p_quantity;
  
  -- Insert work order part record
  INSERT INTO work_order_parts (
    work_order_id, 
    inventory_item_id, 
    quantity_used, 
    unit_cost, 
    notes, 
    added_by
  )
  VALUES (
    p_work_order_id, 
    p_inventory_item_id, 
    p_quantity, 
    v_unit_price, 
    p_notes, 
    p_user_id
  )
  RETURNING id INTO v_part_id;
  
  -- Deduct from inventory
  UPDATE inventory_items 
  SET quantity_on_hand = v_new_qty
  WHERE id = p_inventory_item_id;
  
  -- Create stock adjustment record
  INSERT INTO stock_adjustments (
    inventory_item_id,
    quantity_delta,
    quantity_before,
    quantity_after,
    reason,
    notes,
    created_by
  )
  VALUES (
    p_inventory_item_id,
    -p_quantity,
    v_current_qty,
    v_new_qty,
    'other',
    'Used on work order',
    p_user_id
  );
  
  RETURN v_part_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FUNCTION: Reserve Part for Work Order
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
-- 8. FUNCTION: Fulfill Reservation (Convert to Used Part)
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
-- 9. FUNCTION: Cancel Reservation
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
-- 10. FUNCTION: Get Available Quantity (On Hand - Reserved)
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
-- 11. SCHEDULED JOB: Expire Old Reservations
-- (Run this via pg_cron or application scheduler)
-- ============================================

CREATE OR REPLACE FUNCTION expire_old_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE part_reservations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_part_to_work_order TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_part_for_work_order TO authenticated;
GRANT EXECUTE ON FUNCTION fulfill_part_reservation TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_part_reservation TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_inventory_quantity TO authenticated;
GRANT EXECUTE ON FUNCTION expire_old_reservations TO authenticated;
