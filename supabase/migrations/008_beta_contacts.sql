-- Beta contact form submissions
create table if not exists public.beta_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text not null,
  created_at timestamptz default now()
);

-- Allow anonymous inserts (no auth required for contact form)
alter table public.beta_contacts enable row level security;

create policy "Anyone can insert beta contacts"
  on public.beta_contacts
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated super admins can read (optional, for admin panel later)
create policy "Authenticated users can read beta contacts"
  on public.beta_contacts
  for select
  to authenticated
  using (true);
