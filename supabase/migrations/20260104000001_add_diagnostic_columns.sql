-- Add diagnostic and workflow columns to work_orders table
-- This migration adds support for the diagnostic tool and confirmation call workflow

-- Add diagnostic data columns
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS diagnostic_data JSONB,
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50),
ADD COLUMN IF NOT EXISTS solution_attempted BOOLEAN DEFAULT false;

-- Add confirmation call workflow columns
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS needs_confirmation_call BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS confirmation_call_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmation_call_notes TEXT,
ADD COLUMN IF NOT EXISTS confirmation_call_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS confirmation_call_at TIMESTAMPTZ;

-- Add customer location columns
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS customer_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS customer_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_category ON work_orders(category);
CREATE INDEX IF NOT EXISTS idx_work_orders_needs_confirmation ON work_orders(needs_confirmation_call);
CREATE INDEX IF NOT EXISTS idx_work_orders_confirmation_completed ON work_orders(confirmation_call_completed);
CREATE INDEX IF NOT EXISTS idx_work_orders_location ON work_orders(customer_lat, customer_lng);

-- Add comments for documentation
COMMENT ON COLUMN work_orders.diagnostic_data IS 'JSON data from diagnostic tool session';
COMMENT ON COLUMN work_orders.category IS 'Main category from diagnostic (engine, electrical, brakes, etc.)';
COMMENT ON COLUMN work_orders.subcategory IS 'Specific subcategory from diagnostic';
COMMENT ON COLUMN work_orders.solution_attempted IS 'Whether customer attempted the suggested solution';
COMMENT ON COLUMN work_orders.needs_confirmation_call IS 'Whether a confirmation call is needed';
COMMENT ON COLUMN work_orders.confirmation_call_completed IS 'Whether confirmation call was completed';
COMMENT ON COLUMN work_orders.customer_lat IS 'Customer location latitude';
COMMENT ON COLUMN work_orders.customer_lng IS 'Customer location longitude';
COMMENT ON COLUMN work_orders.customer_address IS 'Customer location address from Mapbox';
