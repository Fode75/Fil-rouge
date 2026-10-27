-- ============================================================
-- RESSOURCERIE - Schéma Supabase (PostgreSQL)
-- ============================================================
-- Projet Fil-Rouge | Stack : Supabase (Auth + DB + Storage + Edge Functions)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- recherche full-text sur items

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'member', 'volunteer');
CREATE TYPE item_status AS ENUM ('available', 'reserved', 'sold', 'donated', 'unavailable');
CREATE TYPE item_category AS ENUM (
  'furniture',
  'clothing',
  'electronics',
  'books',
  'toys',
  'kitchen',
  'tools',
  'sport',
  'decoration',
  'other'
);
CREATE TYPE workshop_status AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlisted');
CREATE TYPE shift_status AS ENUM ('open', 'full', 'cancelled');

-- ============================================================
-- TABLE : profiles (extension de auth.users)
-- ============================================================
-- Supabase crée auth.users automatiquement. On étend avec une table publique.

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
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

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs étendant auth.users de Supabase';
COMMENT ON COLUMN public.profiles.role IS 'Rôle : admin = gestionnaire, member = adhérent, volunteer = bénévole';

-- ============================================================
-- TABLE : items (objets du catalogue)
-- ============================================================

CREATE TABLE public.items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      item_category NOT NULL DEFAULT 'other',
  status        item_status NOT NULL DEFAULT 'available',
  price         NUMERIC(10, 2),          -- null = gratuit / don
  image_urls    TEXT[] DEFAULT '{}',     -- tableau d'URLs Supabase Storage
  reference     TEXT UNIQUE,             -- référence interne ressourcerie
  condition     TEXT,                    -- état de l'objet (bon état, usagé…)
  tags          TEXT[] DEFAULT '{}',
  added_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.items IS 'Catalogue des objets disponibles à la ressourcerie';

-- Index recherche textuelle
CREATE INDEX idx_items_title_trgm ON public.items USING gin (title gin_trgm_ops);
CREATE INDEX idx_items_status ON public.items (status);
CREATE INDEX idx_items_category ON public.items (category);

-- ============================================================
-- TABLE : workshops (ateliers)
-- ============================================================

CREATE TABLE public.workshops (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  short_desc      TEXT,                           -- résumé court pour les cards
  cover_url       TEXT,                           -- image de couverture
  location        TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  max_capacity    INT NOT NULL DEFAULT 10,
  price           NUMERIC(10, 2) DEFAULT 0,       -- 0 = gratuit
  status          workshop_status NOT NULL DEFAULT 'scheduled',
  tags            TEXT[] DEFAULT '{}',
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_workshop_dates CHECK (ends_at > starts_at)
);

COMMENT ON TABLE public.workshops IS 'Ateliers organisés par la ressourcerie';

-- Vue calculée : places restantes
CREATE VIEW public.workshops_with_spots AS
SELECT
  w.*,
  w.max_capacity - COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS spots_left
FROM public.workshops w
LEFT JOIN public.registrations r ON r.workshop_id = w.id
GROUP BY w.id;

-- ============================================================
-- TABLE : registrations (inscriptions aux ateliers)
-- ============================================================

CREATE TABLE public.registrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workshop_id   UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  status        registration_status NOT NULL DEFAULT 'pending',
  notes         TEXT,                            -- message optionnel du participant
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_registration UNIQUE (user_id, workshop_id) -- une seule inscription par user/atelier
);

COMMENT ON TABLE public.registrations IS 'Inscriptions des utilisateurs aux ateliers';

CREATE INDEX idx_registrations_user ON public.registrations (user_id);
CREATE INDEX idx_registrations_workshop ON public.registrations (workshop_id);

-- ============================================================
-- TABLE : shifts (permanences bénévoles)
-- ============================================================

CREATE TABLE public.shifts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

COMMENT ON TABLE public.shifts IS 'Créneaux de permanence pour les bénévoles';

-- ============================================================
-- TABLE : shift_volunteers (junction : qui participe à quelle permanence)
-- ============================================================

CREATE TABLE public.shift_volunteers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id    UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      registration_status NOT NULL DEFAULT 'confirmed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_shift_volunteer UNIQUE (shift_id, user_id)
);

COMMENT ON TABLE public.shift_volunteers IS 'Association bénévoles / créneaux de permanence';

-- ============================================================
-- TRIGGERS : updated_at automatique
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

-- ============================================================
-- TRIGGER : création automatique du profil après inscription
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_volunteers ENABLE ROW LEVEL SECURITY;

-- Helper : récupérer le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- -------------------------------------------------------
-- RLS : profiles
-- -------------------------------------------------------
-- Lecture : chacun voit son propre profil ; admin voit tout
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.get_current_user_role() = 'admin'
  );

-- Mise à jour : chacun modifie le sien ; admin peut tout modifier
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR public.get_current_user_role() = 'admin'
  );

-- Suppression : admin uniquement
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- -------------------------------------------------------
-- RLS : items
-- -------------------------------------------------------
-- Lecture : tout le monde (même non connecté) peut voir les objets disponibles
CREATE POLICY "items_select_public" ON public.items
  FOR SELECT USING (
    status = 'available'
    OR auth.uid() IS NOT NULL  -- connecté → voit tout
  );

-- Création / modification / suppression : admin uniquement
CREATE POLICY "items_insert_admin" ON public.items
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "items_update_admin" ON public.items
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "items_delete_admin" ON public.items
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- -------------------------------------------------------
-- RLS : workshops
-- -------------------------------------------------------
-- Lecture : publique
CREATE POLICY "workshops_select_public" ON public.workshops
  FOR SELECT USING (TRUE);

-- Gestion : admin uniquement
CREATE POLICY "workshops_insert_admin" ON public.workshops
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "workshops_update_admin" ON public.workshops
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "workshops_delete_admin" ON public.workshops
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- -------------------------------------------------------
-- RLS : registrations
-- -------------------------------------------------------
-- Lecture : chacun voit ses propres inscriptions ; admin voit tout
CREATE POLICY "registrations_select" ON public.registrations
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.get_current_user_role() = 'admin'
  );

-- Création : utilisateur connecté pour lui-même
CREATE POLICY "registrations_insert_self" ON public.registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Annulation : chacun peut annuler la sienne ; admin peut tout modifier
CREATE POLICY "registrations_update" ON public.registrations
  FOR UPDATE USING (
    auth.uid() = user_id
    OR public.get_current_user_role() = 'admin'
  );

CREATE POLICY "registrations_delete" ON public.registrations
  FOR DELETE USING (
    auth.uid() = user_id
    OR public.get_current_user_role() = 'admin'
  );

-- -------------------------------------------------------
-- RLS : shifts
-- -------------------------------------------------------
-- Lecture : connectés uniquement
CREATE POLICY "shifts_select_auth" ON public.shifts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Gestion : admin uniquement
CREATE POLICY "shifts_insert_admin" ON public.shifts
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "shifts_update_admin" ON public.shifts
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "shifts_delete_admin" ON public.shifts
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- -------------------------------------------------------
-- RLS : shift_volunteers
-- -------------------------------------------------------
CREATE POLICY "shift_volunteers_select" ON public.shift_volunteers
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.get_current_user_role() = 'admin'
  );

CREATE POLICY "shift_volunteers_insert_self" ON public.shift_volunteers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "shift_volunteers_update" ON public.shift_volunteers
  FOR UPDATE USING (
    auth.uid() = user_id
    OR public.get_current_user_role() = 'admin'
  );

CREATE POLICY "shift_volunteers_delete" ON public.shift_volunteers
  FOR DELETE USING (
    auth.uid() = user_id
    OR public.get_current_user_role() = 'admin'
  );

-- ============================================================
-- STORAGE BUCKETS (à créer via Supabase Dashboard ou CLI)
-- ============================================================
-- supabase storage create items-images   → public : TRUE
-- supabase storage create workshop-covers → public : TRUE
-- supabase storage create avatars         → public : FALSE (accès RLS)

-- ============================================================
-- SEED DATA (données de test / démonstration)
-- ============================================================

-- Note : l'admin doit d'abord être créé via Supabase Auth, puis son rôle mis à jour :
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@ressourcerie.fr';

