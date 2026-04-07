-- ============================================
-- SUPABASE SETUP — Run once per project
-- Copy-paste into Supabase SQL Editor
-- ============================================

-- Chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  songs JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (nextId, admin, etc.)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop old policies if exist
DROP POLICY IF EXISTS "r_ch" ON public.chapters;
DROP POLICY IF EXISTS "w_ch" ON public.chapters;
DROP POLICY IF EXISTS "r_st" ON public.settings;
DROP POLICY IF EXISTS "w_st" ON public.settings;

-- Open policies (anon key can read/write)
-- ⚠️ For production, restrict with auth.uid()
CREATE POLICY "r_ch" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "w_ch" ON public.chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "r_st" ON public.settings FOR SELECT USING (true);
CREATE POLICY "w_st" ON public.settings FOR ALL USING (true) WITH CHECK (true);
