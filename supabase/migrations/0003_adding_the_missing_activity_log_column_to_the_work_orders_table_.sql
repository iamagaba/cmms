ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS activity_log JSONB;