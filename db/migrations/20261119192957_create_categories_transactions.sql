create table if not exists categories (
  id serial primary key,
  name text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists categories_name_lower_idx on categories (lower(name));

create table if not exists transactions (
  id serial primary key,
  type text not null check (type in ('income','expense')),
  amount_cents integer not null check (amount_cents > 0),
  date date not null,
  category_id integer not null references categories(id) on delete restrict,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists transactions_date_idx on transactions (date);
create index if not exists transactions_category_idx on transactions (category_id);

insert into categories (name) values ('Salary'), ('Groceries'), ('Rent'), ('Utilities'), ('Transport'), ('Entertainment'), ('Other')
on conflict do nothing;
