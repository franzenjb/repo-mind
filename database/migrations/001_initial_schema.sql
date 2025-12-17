-- RepoMind Database Schema
-- Run this in Supabase SQL Editor

-- =====================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STUDY SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  repository_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  ai_summary TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Q&A CARDS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.qa_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  source_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SCREENSHOTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  annotations JSONB DEFAULT '[]',
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- =====================================================
-- JUNCTION TABLES (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.session_tags (
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.qa_card_tags (
  qa_card_id UUID REFERENCES public.qa_cards(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (qa_card_id, tag_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.study_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.study_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qa_cards_session_id ON public.qa_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_qa_cards_user_id ON public.qa_cards(user_id);

CREATE INDEX IF NOT EXISTS idx_notes_session_id ON public.notes(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

CREATE INDEX IF NOT EXISTS idx_screenshots_session_id ON public.screenshots(session_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_note_id ON public.screenshots(note_id);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_notes_content_fts ON public.notes
  USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_qa_cards_fts ON public.qa_cards
  USING gin(to_tsvector('english', question || ' ' || answer));
CREATE INDEX IF NOT EXISTS idx_sessions_fts ON public.study_sessions
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_card_tags ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Study sessions policies
CREATE POLICY "Users can view own sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.study_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view own notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- Q&A cards policies
CREATE POLICY "Users can view own qa_cards" ON public.qa_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own qa_cards" ON public.qa_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own qa_cards" ON public.qa_cards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own qa_cards" ON public.qa_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Screenshots policies
CREATE POLICY "Users can view own screenshots" ON public.screenshots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own screenshots" ON public.screenshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own screenshots" ON public.screenshots
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own screenshots" ON public.screenshots
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Junction tables policies (session_tags)
CREATE POLICY "Users can manage session_tags" ON public.session_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.study_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Junction tables policies (note_tags)
CREATE POLICY "Users can manage note_tags" ON public.note_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND user_id = auth.uid())
  );

-- Junction tables policies (qa_card_tags)
CREATE POLICY "Users can manage qa_card_tags" ON public.qa_card_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.qa_cards WHERE id = qa_card_id AND user_id = auth.uid())
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.study_sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qa_cards_updated_at ON public.qa_cards;
CREATE TRIGGER update_qa_cards_updated_at BEFORE UPDATE ON public.qa_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Full-text search function
CREATE OR REPLACE FUNCTION search_all_content(search_query TEXT, p_user_id UUID)
RETURNS TABLE (
  result_type TEXT,
  result_id UUID,
  title TEXT,
  snippet TEXT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'session'::TEXT, s.id, s.title, LEFT(s.description, 200),
         ts_rank(to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')), plainto_tsquery('english', search_query))
  FROM public.study_sessions s
  WHERE s.user_id = p_user_id
    AND to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('english', search_query)
  UNION ALL
  SELECT 'note'::TEXT, n.id, n.title, LEFT(n.content, 200),
         ts_rank(to_tsvector('english', n.title || ' ' || n.content), plainto_tsquery('english', search_query))
  FROM public.notes n
  WHERE n.user_id = p_user_id
    AND to_tsvector('english', n.title || ' ' || n.content) @@ plainto_tsquery('english', search_query)
  UNION ALL
  SELECT 'qa_card'::TEXT, q.id, q.question, LEFT(q.answer, 200),
         ts_rank(to_tsvector('english', q.question || ' ' || q.answer), plainto_tsquery('english', search_query))
  FROM public.qa_cards q
  WHERE q.user_id = p_user_id
    AND to_tsvector('english', q.question || ' ' || q.answer) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
-- Run this in SQL Editor to create storage bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

-- Storage policies (run after creating bucket)
-- CREATE POLICY "Users can upload screenshots" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own screenshots" ON storage.objects
--   FOR SELECT USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own screenshots" ON storage.objects
--   FOR DELETE USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
