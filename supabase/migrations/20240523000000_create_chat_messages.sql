-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  contact_phone text not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  type text not null default 'text',
  content text,
  status text default 'sent' check (status in ('sent', 'delivered', 'read', 'failed')),
  wa_message_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_messages enable row level security;

-- Create policies (modify as needed for your auth setup)
-- Allow authenticated users to view all messages (simple for support dashboard)
create policy "Authenticated users can view chat messages"
  on public.chat_messages for select
  to authenticated
  using (true);

-- Allow authenticated users to insert outbound messages
create policy "Authenticated users can insert outbound messages"
  on public.chat_messages for insert
  to authenticated
  with check (direction = 'outbound');

-- Allow service role (Edge Functions) to do everything
create policy "Service role can do everything"
  on public.chat_messages
  to service_role
  using (true)
  with check (true);

-- Grant access to authenticated users and service role
grant all on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;

-- Create realtime publication if not exists
begin;
  insert into realtime.subscription (publication_name, schema_name, table_name)
  values ('supabase_realtime', 'public', 'chat_messages')
  on conflict do nothing;
commit;

-- Ensure table is in the publication
alter publication supabase_realtime add table public.chat_messages;
