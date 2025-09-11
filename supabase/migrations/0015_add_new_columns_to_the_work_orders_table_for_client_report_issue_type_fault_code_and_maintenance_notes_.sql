ALTER TABLE public.work_orders
ADD COLUMN client_report TEXT,
ADD COLUMN issue_type TEXT,
ADD COLUMN fault_code TEXT,
ADD COLUMN maintenance_notes TEXT;