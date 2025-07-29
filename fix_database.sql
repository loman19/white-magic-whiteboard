-- Drop the table if it exists
DROP TABLE IF EXISTS public.whiteboard_data;

-- Recreate the table with the correct unique constraint
CREATE TABLE public.whiteboard_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.whiteboard_sessions(id) UNIQUE,
  data jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whiteboard_data ENABLE ROW LEVEL SECURITY;

-- Create policies for whiteboard_data table
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

-- Create index
CREATE INDEX idx_whiteboard_data_session_id ON public.whiteboard_data(session_id); 