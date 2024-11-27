create table if not exists sync_status (
  type text primary key,
  last_synced_at timestamptz,
  "offset" text,
  in_progress boolean default false,
  error text
);

create table if not exists sync_errors (
  id uuid default uuid_generate_v4() primary key,
  record_id text not null,
  error text not null,
  timestamp timestamptz default now()
); 