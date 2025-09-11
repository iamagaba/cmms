-- Allow authenticated users to read all technician data
CREATE POLICY "Allow authenticated users to read technicians" ON public.technicians
FOR SELECT TO authenticated USING (true);

-- Allow technicians to update their own profile
CREATE POLICY "Technicians can update their own profile" ON public.technicians
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow admins to manage all technician data (insert, update, delete)
CREATE POLICY "Admins can manage all technicians" ON public.technicians
FOR ALL TO authenticated USING (public.is_current_user_admin());