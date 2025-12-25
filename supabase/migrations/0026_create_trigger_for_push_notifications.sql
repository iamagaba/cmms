-- Function to automatically trigger push notifications
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- Call the edge function to send push notification
  -- Note: This requires the Supabase CLI and proper setup of edge functions
  PERFORM
    net.http_post(
      url := supabase_url() || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_service_role_key()
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );

  RETURN NEW;
END;
$$;

-- Create trigger on notifications table to automatically send push notifications
CREATE OR REPLACE TRIGGER send_push_notification_trigger
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_push_notification();
