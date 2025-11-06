-- ============================================================================
-- FASE 1: DATABASE SCHEMA PER SISTEMA EDUCATIVO BITCOIN/CRYPTO
-- ============================================================================

-- Enum per livelli dei corsi
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Enum per tipi di lezione
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'interactive', 'quiz', 'practical');

-- Enum per livelli di rischio
CREATE TYPE risk_level AS ENUM ('conservative', 'moderate', 'aggressive', 'expert');

-- ============================================================================
-- TABELLA: educational_courses
-- Corsi educativi disponibili sulla piattaforma
-- ============================================================================
CREATE TABLE public.educational_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level course_level NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER,
  prerequisites TEXT[], -- Array di course_id prerequisiti
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABELLA: course_modules
-- Moduli che compongono ogni corso
-- ============================================================================
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.educational_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, order_index)
);

-- ============================================================================
-- TABELLA: lessons
-- Lezioni individuali all'interno dei moduli
-- ============================================================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- Contenuto testuale della lezione
  lesson_type lesson_type NOT NULL DEFAULT 'text',
  order_index INTEGER NOT NULL,
  video_url TEXT,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, order_index)
);

-- ============================================================================
-- TABELLA: user_progress
-- Traccia il progresso degli utenti nei corsi
-- ============================================================================
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.educational_courses(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  completion_percentage NUMERIC(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- ============================================================================
-- TABELLA: lesson_completions
-- Traccia il completamento delle singole lezioni
-- ============================================================================
CREATE TABLE public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER,
  notes TEXT,
  UNIQUE(user_id, lesson_id)
);

-- ============================================================================
-- TABELLA: quizzes
-- Quiz associati alle lezioni
-- ============================================================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array di domande con risposte multiple
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABELLA: quiz_attempts
-- Tentativi degli utenti sui quiz
-- ============================================================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  answers JSONB NOT NULL, -- Risposte fornite dall'utente
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempt_number INTEGER NOT NULL DEFAULT 1
);

-- ============================================================================
-- TABELLA: user_risk_profiles
-- Profilo di rischio e esperienza crypto degli utenti (gestito da AI)
-- ============================================================================
CREATE TABLE public.user_risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  risk_level risk_level NOT NULL DEFAULT 'conservative',
  crypto_experience TEXT, -- Descrizione dell'esperienza
  investment_goals TEXT[], -- Obiettivi di investimento
  recommended_courses UUID[], -- Array di course_id raccomandati
  ai_assessment JSONB, -- Valutazione completa dell'AI con reasoning
  quiz_responses JSONB, -- Risposte al questionario iniziale
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDICI PER PERFORMANCE
-- ============================================================================
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_lesson_completions_user_id ON public.lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_lesson_id ON public.lesson_completions(lesson_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_user_risk_profiles_user_id ON public.user_risk_profiles(user_id);

-- ============================================================================
-- TRIGGER PER UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_educational_courses_updated_at
  BEFORE UPDATE ON public.educational_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_risk_profiles_updated_at
  BEFORE UPDATE ON public.user_risk_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- educational_courses: Tutti possono vedere i corsi pubblicati
ALTER TABLE public.educational_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
  ON public.educational_courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all courses"
  ON public.educational_courses FOR ALL
  USING (is_admin_safe());

-- course_modules: Accessibili se il corso è pubblicato
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules of published courses"
  ON public.course_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.educational_courses
    WHERE id = course_modules.course_id AND is_published = true
  ));

CREATE POLICY "Admins can manage all modules"
  ON public.course_modules FOR ALL
  USING (is_admin_safe());

-- lessons: Accessibili se il corso è pubblicato
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons of published courses"
  ON public.lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.educational_courses ec ON cm.course_id = ec.id
    WHERE cm.id = lessons.module_id AND ec.is_published = true
  ));

CREATE POLICY "Admins can manage all lessons"
  ON public.lessons FOR ALL
  USING (is_admin_safe());

-- user_progress: Gli utenti gestiscono il proprio progresso
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.user_progress FOR SELECT
  USING (is_admin_safe());

-- lesson_completions: Gli utenti gestiscono i propri completamenti
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own completions"
  ON public.lesson_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions"
  ON public.lesson_completions FOR SELECT
  USING (is_admin_safe());

-- quizzes: Visibili per tutti gli utenti autenticati
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all quizzes"
  ON public.quizzes FOR ALL
  USING (is_admin_safe());

-- quiz_attempts: Gli utenti gestiscono i propri tentativi
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
  ON public.quiz_attempts FOR SELECT
  USING (is_admin_safe());

-- user_risk_profiles: Gli utenti gestiscono il proprio profilo
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own risk profile"
  ON public.user_risk_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk profile"
  ON public.user_risk_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk profile"
  ON public.user_risk_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all risk profiles"
  ON public.user_risk_profiles FOR SELECT
  USING (is_admin_safe());