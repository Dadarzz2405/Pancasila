-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- TABLES
-- =====================

create table units (
  id uuid primary key default uuid_generate_v4(),
  sila_number int not null,
  title text not null,
  hook_question text not null,
  color_accent text not null
);

create table reflections (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references units(id) on delete cascade,
  author_id uuid references auth.users(id),
  content text not null,
  is_anonymous boolean default true,
  author_name text default 'Anonim',
  status text check (status in ('pending', 'verified', 'rejected')) default 'pending',
  ai_feedback text,
  created_at timestamptz default now()
);

create table discussions (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references units(id) on delete cascade,
  author_id uuid references auth.users(id),
  title text not null,
  content text not null,
  status text check (status in ('pending', 'verified', 'rejected')) default 'pending',
  ai_feedback text,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  discussion_id uuid references discussions(id) on delete cascade,
  author_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz default now()
);

-- =====================
-- SEED: 5 UNITS
-- =====================

insert into units (sila_number, title, hook_question, color_accent) values
  (1, 'Ketuhanan Yang Maha Esa',                              'Bagaimana kamu menjaga toleransi beragama di dunia digital?',                              '#D32F2F'),
  (2, 'Kemanusiaan yang Adil dan Beradab',                    'Pernahkah kamu menyaksikan cyberbullying? Apa yang kamu lakukan?',                         '#C62828'),
  (3, 'Persatuan Indonesia',                                  'Konten seperti apa yang menurutmu memperkuat persatuan bangsa?',                            '#B71C1C'),
  (4, 'Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan',  'Bagaimana cara berdemokrasi yang sehat di media sosial?',                                   '#D4AF37'),
  (5, 'Keadilan Sosial bagi Seluruh Rakyat Indonesia',       'Apakah akses internet yang tidak merata adalah masalah keadilan sosial?',                   '#8B7536');

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table units        enable row level security;
alter table reflections  enable row level security;
alter table discussions  enable row level security;
alter table messages     enable row level security;

-- Units: public read
create policy "units_public_read"        on units        for select using (true);

-- Reflections: public sees verified; owner sees own
create policy "reflections_public_read"  on reflections  for select using (status = 'verified');
create policy "reflections_own_read"     on reflections  for select using (auth.uid() = author_id);
create policy "reflections_insert"       on reflections  for insert with check (auth.uid() = author_id);

-- Discussions: same pattern as reflections
create policy "discussions_public_read"  on discussions  for select using (status = 'verified');
create policy "discussions_own_read"     on discussions  for select using (auth.uid() = author_id);
create policy "discussions_insert"       on discussions  for insert with check (auth.uid() = author_id);

-- Messages: any authenticated user
create policy "messages_read"            on messages     for select using (auth.uid() is not null);
create policy "messages_insert"          on messages     for insert with check (auth.uid() = author_id);

-- =====================
-- REALTIME
-- =====================

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table reflections;
