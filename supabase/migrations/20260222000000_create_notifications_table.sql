-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('work_order_assigned', 'work_order_overdue', 'work_order_completed', 'work_order_updated')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_work_order_id ON notifications(work_order_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Function to create notification for work order assignment
CREATE OR REPLACE FUNCTION notify_work_order_assigned()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification if assigned_to changed and is not null
    IF (TG_OP = 'UPDATE' AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL) OR
       (TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL) THEN
        
        INSERT INTO notifications (user_id, type, title, message, work_order_id)
        VALUES (
            NEW.assigned_to,
            'work_order_assigned',
            'New Work Order Assigned',
            'Work Order #' || NEW.work_order_number || ' has been assigned to you',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for overdue work orders
CREATE OR REPLACE FUNCTION notify_overdue_work_orders()
RETURNS void AS $$
DECLARE
    overdue_wo RECORD;
BEGIN
    -- Find all overdue work orders that haven't been notified in the last 24 hours
    FOR overdue_wo IN
        SELECT wo.id, wo.work_order_number, wo.assigned_to, wo.sla_due
        FROM work_orders wo
        WHERE wo.status NOT IN ('Completed', 'Cancelled')
          AND wo.sla_due < NOW()
          AND wo.assigned_to IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM notifications n
              WHERE n.work_order_id = wo.id
                AND n.type = 'work_order_overdue'
                AND n.created_at > NOW() - INTERVAL '24 hours'
          )
    LOOP
        INSERT INTO notifications (user_id, type, title, message, work_order_id)
        VALUES (
            overdue_wo.assigned_to,
            'work_order_overdue',
            'Work Order Overdue',
            'Work Order #' || overdue_wo.work_order_number || ' is overdue',
            overdue_wo.id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for work order assignment
DROP TRIGGER IF EXISTS trigger_notify_work_order_assigned ON work_orders;
CREATE TRIGGER trigger_notify_work_order_assigned
    AFTER INSERT OR UPDATE OF assigned_to ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_work_order_assigned();

-- Create a scheduled job to check for overdue work orders (runs every hour)
-- Note: This requires pg_cron extension which may need to be enabled in Supabase dashboard
-- Alternatively, this can be called from an Edge Function on a schedule
COMMENT ON FUNCTION notify_overdue_work_orders() IS 'Call this function periodically (e.g., via Edge Function) to notify users of overdue work orders';
