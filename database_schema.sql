-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.whiteboard_data;
DROP TABLE IF EXISTS public.whiteboard_sessions;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id),
  name text,
  email text UNIQUE
);

CREATE TABLE public.whiteboard_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text UNIQUE,
  owner_id text, -- changed from uuid to text to allow guest users
  participants text[], -- array of participant IDs (user IDs or guest names)
  current_drawer text, -- who is currently allowed to draw
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.whiteboard_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.whiteboard_sessions(id) UNIQUE, -- Added UNIQUE constraint
  data jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_data ENABLE ROW LEVEL SECURITY;

-- Create policies AFTER table creation
-- Allow anyone to select
CREATE POLICY "Allow select for all"
  ON public.whiteboard_sessions
  FOR SELECT
  USING (true);

-- Allow anyone to insert
CREATE POLICY "Allow insert for all"
  ON public.whiteboard_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update
CREATE POLICY "Allow update for all"
  ON public.whiteboard_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete
CREATE POLICY "Allow delete for all"
  ON public.whiteboard_sessions
  FOR DELETE
  USING (true);

-- Policies for whiteboard_data table
CREATE POLICY "Allow select for all"
  ON public.whiteboard_data
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for all"
  ON public.whiteboard_data
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for all"
  ON public.whiteboard_data
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for all"
  ON public.whiteboard_data
  FOR DELETE
  USING (true);

-- Policies for profiles table
CREATE POLICY "Allow select for all"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for all"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for all"
  ON public.profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for all"
  ON public.profiles
  FOR DELETE
  USING (true);

-- Optional: Create indexes for foreign key columns to optimize joins
CREATE INDEX idx_whiteboard_sessions_owner_id ON public.whiteboard_sessions(owner_id);
CREATE INDEX idx_whiteboard_data_session_id ON public.whiteboard_data(session_id); 