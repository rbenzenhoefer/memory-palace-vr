create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  is_home boolean not null default false,
  theme jsonb not null default '{}',
  layout jsonb not null default '{}',
  source text not null default 'manual',
  created_at timestamptz default now()
);
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  source text not null default 'primitive',
  meshy_task_id text,
  prompt text,
  status text not null default 'ready',
  default_scale real not null default 1,
  created_at timestamptz default now()
);
create table public.loci (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  order_index int not null default 0,
  label text not null,
  position jsonb not null default '[0,0,0]',
  rotation jsonb not null default '[0,0,0]',
  scale real not null default 1,
  asset_id uuid references public.assets(id) on delete set null,
  primitive jsonb not null default '{"shape":"box","color":"#8888ff"}'
);
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  locus_id uuid not null references public.loci(id) on delete cascade,
  front text not null,
  back text not null,
  extra text,
  source text not null default 'manual',
  external_id text,
  created_at timestamptz default now()
);
create table public.portals (
  id uuid primary key default gen_random_uuid(),
  from_room_id uuid not null references public.rooms(id) on delete cascade,
  to_room_id uuid not null references public.rooms(id) on delete cascade,
  position jsonb not null default '[0,0,0]',
  rotation jsonb not null default '[0,0,0]',
  label text
);

grant select on public.rooms, public.assets, public.loci, public.cards, public.portals to anon, authenticated;
grant all on public.rooms, public.assets, public.loci, public.cards, public.portals to service_role;

alter table public.rooms enable row level security;
alter table public.assets enable row level security;
alter table public.loci enable row level security;
alter table public.cards enable row level security;
alter table public.portals enable row level security;

create policy "Public read rooms" on public.rooms for select to anon, authenticated using (true);
create policy "Public read assets" on public.assets for select to anon, authenticated using (true);
create policy "Public read loci" on public.loci for select to anon, authenticated using (true);
create policy "Public read cards" on public.cards for select to anon, authenticated using (true);
create policy "Public read portals" on public.portals for select to anon, authenticated using (true);

create index on public.loci(room_id);
create index on public.cards(locus_id);
create index on public.portals(from_room_id);