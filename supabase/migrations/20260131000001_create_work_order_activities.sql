-- Migration: Create work_order_activities table for vertical activity timeline
-- This table stores all activities related to work orders for timeline display

-- Create work_order_activities table
CREATE TABLE IF NOT EXISTS work_order_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  user_name VARCHAR(255) NOT NULL,
  user_avatar VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_activity_type CHECK (
    activity_type IN (
      'created',
      'assigned', 
      'started',
      'paused',
      'completed',
      'note_added',
      'status_changed',
      'priority_changed'
    )
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_order_activities_work_order_id ON work_order_activities(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_activities_created_at ON work_order_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_work_order_activities_type ON work_order_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_work_order_activities_user ON work_order_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_work_order_activities_timeline ON work_order_activities(work_order_id, created_at DESC);

-- Enable real-time subscriptions
ALTER TABLE work_order_activities REPLICA IDENTITY FULL;

-- Add table to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE work_order_activities;

-- Add comments for documentation
COMMENT ON TABLE work_order_activities IS 'Stores chronological activities for work order timeline display';
COMMENT ON COLUMN work_order_activities.activity_type IS 'Type of activity: created, assigned, started, paused, completed, note_added, status_changed, priority_changed';
COMMENT ON COLUMN work_order_activities.title IS 'Short descriptive title of the activity';
COMMENT ON COLUMN work_order_activities.description IS 'Optional detailed description of the activity';
COMMENT ON COLUMN work_order_activities.user_name IS 'Display name of the user who performed the activity';
COMMENT ON COLUMN work_order_activities.user_avatar IS 'URL to user avatar image';
COMMENT ON COLUMN work_order_activities.metadata IS 'JSON metadata for activity-specific data (previous/new values, assignments, etc.)';

-- Create function to automatically create activity when work order is created
CREATE OR REPLACE FUNCTION create_work_order_created_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO work_order_activities (
    work_order_id,
    activity_type,
    title,
    description,
    user_id,
    user_name,
    metadata
  ) VALUES (
    NEW.id,
    'created',
    'Work order created',
    CASE 
      WHEN NEW.service IS NOT NULL THEN 'Work order created for: ' || NEW.service
      ELSE 'Work order created'
    END,
    NEW.created_by,
    COALESCE(
      (SELECT CONCAT(first_name, ' ', last_name) FROM profiles WHERE id = NEW.created_by),
      'System'
    ),
    jsonb_build_object(
      'work_order_number', NEW.work_order_number,
      'priority', NEW.priority,
      'status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for work order creation
DROP TRIGGER IF EXISTS trigger_create_work_order_activity ON work_orders;
CREATE TRIGGER trigger_create_work_order_activity
  AFTER INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION create_work_order_created_activity();

-- Create function to track work order updates
CREATE OR REPLACE FUNCTION track_work_order_updates()
RETURNS TRIGGER AS $$
DECLARE
  activity_title VARCHAR(255);
  activity_description TEXT;
  activity_type VARCHAR(50);
  activity_metadata JSONB := '{}';
  user_display_name VARCHAR(255);
BEGIN
  -- Get user display name
  SELECT COALESCE(CONCAT(first_name, ' ', last_name), 'System')
  INTO user_display_name
  FROM profiles 
  WHERE id = COALESCE(NEW.created_by, OLD.created_by);
  
  -- Track status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    activity_type := 'status_changed';
    activity_title := 'Status changed';
    activity_description := 'Status changed from "' || COALESCE(OLD.status, 'None') || '" to "' || COALESCE(NEW.status, 'None') || '"';
    activity_metadata := jsonb_build_object(
      'previous_value', OLD.status,
      'new_value', NEW.status
    );
    
    -- Special handling for specific status changes
    IF NEW.status = 'In Progress' THEN
      activity_type := 'started';
      activity_title := 'Work started';
      activity_description := 'Work order started';
    ELSIF NEW.status = 'On Hold' THEN
      activity_type := 'paused';
      activity_title := 'Work paused';
      activity_description := 'Work order put on hold' || 
        CASE WHEN NEW.on_hold_reason IS NOT NULL THEN ': ' || NEW.on_hold_reason ELSE '' END;
    ELSIF NEW.status = 'Completed' THEN
      activity_type := 'completed';
      activity_title := 'Work completed';
      activity_description := 'Work order completed';
    END IF;
    
    INSERT INTO work_order_activities (
      work_order_id, activity_type, title, description, user_id, user_name, metadata
    ) VALUES (
      NEW.id, activity_type, activity_title, activity_description, 
      COALESCE(NEW.created_by, OLD.created_by), user_display_name, activity_metadata
    );
  END IF;
  
  -- Track assignment changes
  IF OLD.assigned_technician_id IS DISTINCT FROM NEW.assigned_technician_id THEN
    activity_type := 'assigned';
    activity_title := 'Technician assigned';
    
    IF NEW.assigned_technician_id IS NULL THEN
      activity_description := 'Technician unassigned';
    ELSE
      activity_description := 'Assigned to ' || COALESCE(
        (SELECT name FROM technicians WHERE id = NEW.assigned_technician_id),
        'Unknown Technician'
      );
    END IF;
    
    activity_metadata := jsonb_build_object(
      'previous_technician_id', OLD.assigned_technician_id,
      'new_technician_id', NEW.assigned_technician_id,
      'assigned_by', COALESCE(NEW.created_by, OLD.created_by)
    );
    
    INSERT INTO work_order_activities (
      work_order_id, activity_type, title, description, user_id, user_name, metadata
    ) VALUES (
      NEW.id, activity_type, activity_title, activity_description,
      COALESCE(NEW.created_by, OLD.created_by), user_display_name, activity_metadata
    );
  END IF;
  
  -- Track priority changes
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    activity_type := 'priority_changed';
    activity_title := 'Priority changed';
    activity_description := 'Priority changed from "' || COALESCE(OLD.priority, 'None') || '" to "' || COALESCE(NEW.priority, 'None') || '"';
    activity_metadata := jsonb_build_object(
      'previous_value', OLD.priority,
      'new_value', NEW.priority
    );
    
    INSERT INTO work_order_activities (
      work_order_id, activity_type, title, description, user_id, user_name, metadata
    ) VALUES (
      NEW.id, activity_type, activity_title, activity_description,
      COALESCE(NEW.created_by, OLD.created_by), user_display_name, activity_metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for work order updates
DROP TRIGGER IF EXISTS trigger_track_work_order_updates ON work_orders;
CREATE TRIGGER trigger_track_work_order_updates
  AFTER UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION track_work_order_updates();