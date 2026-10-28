-- ============================================================
-- RESSOURCERIE — Schéma PostgreSQL (API Express custom)
-- ============================================================
-- Pas de Supabase : on gère auth et BDD directement.
-- Appliquer ce fichier via pgAdmin ou psql :
--   psql -U postgres -d ressourcerie -f schema.sql
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- recherche full-text

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'member', 'volunteer');
CREATE TYPE item_status AS ENUM ('available', 'reserved', 'sold', 'donated', 'unavailable');
CREATE TYPE item_category AS ENUM (
  'furniture', 'clothing', 'electronics', 'books',
  'toys', 'kitchen', 'tools', 'sport', 'decoration', 'other'
);
CREATE TYPE workshop_status AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlisted');
CREATE TYPE shift_status AS ENUM ('open', 'full', 'cancelled');

-- ============================================================
-- TABLE : profiles (utilisateurs)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,          -- bcrypt hash géré par l'API
  first_name    TEXT,
  last_name     TEXT,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'member',
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  newsletter    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles (email);

-- ============================================================
-- TABLE : items (objets du catalogue)
-- ============================================================
CREATE TABLE public.items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      item_category NOT NULL DEFAULT 'other',
  status        item_status NOT NULL DEFAULT 'available',
  price         NUMERIC(10, 2),
  image_urls    TEXT[] DEFAULT '{}',
  reference     TEXT UNIQUE,
  condition     TEXT,
  tags          TEXT[] DEFAULT '{}',
  added_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_title_trgm ON public.items USING gin (title gin_trgm_ops);
CREATE INDEX idx_items_status     ON public.items (status);
CREATE INDEX idx_items_category   ON public.items (category);

-- ============================================================
-- TABLE : workshops (ateliers)
-- ============================================================
CREATE TABLE public.workshops (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  short_desc    TEXT,
  cover_url     TEXT,
  location      TEXT,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  max_capacity  INT NOT NULL DEFAULT 10,
  price         NUMERIC(10, 2) DEFAULT 0,
  status        workshop_status NOT NULL DEFAULT 'scheduled',
  tags          TEXT[] DEFAULT '{}',
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_workshop_dates CHECK (ends_at > starts_at)
);

CREATE INDEX idx_workshops_starts_at ON public.workshops (starts_at);

-- ============================================================
-- TABLE : registrations (inscriptions aux ateliers)
-- ============================================================
CREATE TABLE public.registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workshop_id   UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  status        registration_status NOT NULL DEFAULT 'pending',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_registration UNIQUE (user_id, workshop_id)
);

CREATE INDEX idx_registrations_user     ON public.registrations (user_id);
CREATE INDEX idx_registrations_workshop ON public.registrations (workshop_id);
CREATE INDEX idx_registrations_status   ON public.registrations (status);

-- ============================================================
-- TABLE : shifts (permanences bénévoles)
-- ============================================================
CREATE TABLE public.shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL DEFAULT 'Permanence',
  description     TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  location        TEXT,
  max_volunteers  INT NOT NULL DEFAULT 3,
  status          shift_status NOT NULL DEFAULT 'open',
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_shift_dates CHECK (ends_at > starts_at)
);

CREATE INDEX idx_shifts_starts_at ON public.shifts (starts_at);

-- ============================================================
-- TABLE : shift_volunteers (bénévoles par créneau)
-- ============================================================
CREATE TABLE public.shift_volunteers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id    UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      registration_status NOT NULL DEFAULT 'confirmed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_shift_volunteer UNIQUE (shift_id, user_id)
);

CREATE INDEX idx_shift_volunteers_shift ON public.shift_volunteers (shift_id);

-- ============================================================
-- TRIGGER : updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_workshops_updated_at
  BEFORE UPDATE ON public.workshops
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
