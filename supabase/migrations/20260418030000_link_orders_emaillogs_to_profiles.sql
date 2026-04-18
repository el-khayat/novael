-- =====================================================================
-- Expose foreign-key relationships between public tables and profiles
-- so PostgREST can embed `profile:profiles(...)` queries.
--
-- profiles.id is itself FK'd to auth.users(id) ON DELETE CASCADE, so
-- pointing user-owned columns at profiles instead is functionally
-- equivalent and lets PostgREST traverse the relationship.
-- =====================================================================

-- orders.user_id -> profiles(id)
do $$
declare
  conname text;
begin
  -- drop any existing FK on orders.user_id (it currently points at auth.users)
  for conname in
    select tc.constraint_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema   = kcu.table_schema
    where tc.table_schema   = 'public'
      and tc.table_name     = 'orders'
      and tc.constraint_type = 'FOREIGN KEY'
      and kcu.column_name   = 'user_id'
  loop
    execute format('alter table public.orders drop constraint %I', conname);
  end loop;
end $$;

alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete set null;

-- email_logs.sent_by -> profiles(id)
do $$
declare
  conname text;
begin
  for conname in
    select tc.constraint_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema   = kcu.table_schema
    where tc.table_schema   = 'public'
      and tc.table_name     = 'email_logs'
      and tc.constraint_type = 'FOREIGN KEY'
      and kcu.column_name   = 'sent_by'
  loop
    execute format('alter table public.email_logs drop constraint %I', conname);
  end loop;
end $$;

alter table public.email_logs
  add constraint email_logs_sent_by_fkey
  foreign key (sent_by) references public.profiles(id) on delete set null;

-- ask PostgREST to refresh its schema cache immediately
notify pgrst, 'reload schema';
