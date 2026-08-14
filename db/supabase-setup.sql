-- Run this once in Supabase's SQL Editor to create the tables your site needs.
-- Go to your Supabase project -> SQL Editor -> New query -> paste this -> Run.

create table if not exists admins (
  id bigint generated always as identity primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists products (
  id bigint generated always as identity primary key,
  title text not null,
  category text default '',
  description text default '',
  image_path text,
  image_public_id text,
  created_at timestamptz default now()
);

create table if not exists visits (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  page text default '/',
  ip text default '',
  created_at timestamptz default now()
);
