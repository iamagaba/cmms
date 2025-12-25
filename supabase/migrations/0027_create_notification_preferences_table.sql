-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  work_order_status_changes BOOLEAN DEFAULT true,
  sla_alerts BOOLEAN DEFAULT true,
  emergency_bike_assignments BOOLEAN DEFAULT true,
  inventory_alerts BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  notification_types TEXT[] DEFAULT ARRAY['email', 'push'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically send push notifications with user preferences
CREATE OR REPLACE FUNCTION public.send_push_notification_with_preferences()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  pref_record RECORD;
  current_time_val TIME;
BEGIN
  -- Get user preferences
  SELECT * INTO pref_record
  FROM public.notification_preferences
  WHERE user_id = NEW.user_id;

  -- If no preferences exist, send notification anyway
  IF pref_record IS NULL OR pref_record.push_enabled = true THEN
    -- Check quiet hours
    current_time_val := LOCALTIME;

    IF pref_record IS NULL OR
       (pref_record.quiet_hours_start IS NULL OR pref_record.quiet_hours_end IS NULL) OR
       (current_time_val < pref_record.quiet_hours_start OR current_time_val > pref_record.quiet_hours_end) THEN

      -- Call the edge function to send push notification
      PERFORM
        net.http_post(
          url := supabase_url() || '/functions/v1/send-push-notification',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || supabase_service_role_key()
          ),
          body := jsonb_build_object('record', row_to_json(NEW))
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS send_push_notification_trigger ON public.notifications;
CREATE OR REPLACE TRIGGER send_push_notification_trigger
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification_with_preferences();

-- Create a trigger to update updated_at column
CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at_trigger
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_preferences_updated_at();
