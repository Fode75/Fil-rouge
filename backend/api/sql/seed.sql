-- ============================================================
-- seed.sql — Données de test pour la Ressourcerie (API Express)
-- ============================================================
-- Nettoyage puis insertion de données réalistes.
-- Les mots de passe sont le hash bcrypt de "password123"
-- ============================================================

TRUNCATE TABLE
  public.shift_volunteers,
  public.shifts,
  public.registrations,
  public.workshops,
  public.items,
  public.profiles
CASCADE;

-- ============================================================
-- PROFILS
-- password_hash = bcrypt("password123", rounds=12)
-- ============================================================
INSERT INTO public.profiles (id, email, password_hash, first_name, last_name, role, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@ressourcerie.fr',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/IfR5oJZdFZg.lnNyS',
   'Marie', 'Dupont', 'admin', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'alice@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/IfR5oJZdFZg.lnNyS',
   'Alice', 'Martin', 'member', TRUE),
  ('00000000-0000-0000-0000-000000000003', 'bob@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/IfR5oJZdFZg.lnNyS',
   'Bob', 'Bernard', 'member', TRUE),
  ('00000000-0000-0000-0000-000000000004', 'claire@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/IfR5oJZdFZg.lnNyS',
   'Claire', 'Lefebvre', 'volunteer', TRUE),
  ('00000000-0000-0000-0000-000000000005', 'david@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/IfR5oJZdFZg.lnNyS',
   'David', 'Moreau', 'volunteer', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ARTICLES
-- ============================================================
INSERT INTO public.items (title, description, category, status, price, condition, added_by) VALUES
  ('Chaise en bois',      'Chaise en bois massif, légèrement patinée.',           'furniture',    'available',  15.00, 'Bon état',   '00000000-0000-0000-0000-000000000001'),
  ('Lampe de chevet',     'Lampe de chevet vintage avec abat-jour en tissu.',     'electronics',  'available',   8.00, 'Bon état',   '00000000-0000-0000-0000-000000000001'),
  ('Lot de 4 livres',     'Romans et essais variés, très bon état.',              'books',        'available',   5.00, 'Très bon',   '00000000-0000-0000-0000-000000000001'),
  ('Table basse',         'Table basse en chêne massif, style scandinave.',       'furniture',    'reserved',   45.00, 'Bon état',   '00000000-0000-0000-0000-000000000001'),
  ('Veste en jean',       'Veste en jean taille M, très peu portée.',             'clothing',     'available',  12.00, 'Excellent',  '00000000-0000-0000-0000-000000000001'),
  ('Perceuse Bosch',      'Perceuse sans fil avec 2 batteries. Fonctionne.',      'tools',        'available',  25.00, 'Bon état',   '00000000-0000-0000-0000-000000000001'),
  ('Vélo enfant',         'Vélo 20 pouces pour enfant 6-9 ans.',                  'sport',        'sold',       30.00, 'Usagé',      '00000000-0000-0000-0000-000000000001'),
  ('Cadre photo 30x40',   'Cadre photo en bois blanc, format 30x40.',             'decoration',   'available',   3.00, 'Très bon',   '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- ATELIERS
-- ============================================================
INSERT INTO public.workshops (id, title, description, location, starts_at, ends_at, max_capacity, price, status, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Réparer sa lampe',
   'Diagnostiquer une panne simple et remplacer un câble.',
   'Atelier principal',
   '2026-11-14 14:00:00+01', '2026-11-14 16:00:00+01', 8, 0, 'scheduled',
   '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002',
   'Rempailler une chaise',
   'Redonner une assise à une chaise en bois.',
   'Atelier principal',
   '2026-11-21 10:00:00+01', '2026-11-21 13:00:00+01', 6, 5, 'scheduled',
   '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003',
   'Customiser un livre',
   'Reliure et couvertures à partir de matériaux de récupération.',
   'Salle polyvalente',
   '2026-12-05 15:00:00+01', '2026-12-05 17:00:00+01', 10, 0, 'scheduled',
   '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004',
   'Soudure pour débutants',
   'Initiation à la soudure sur petits projets métalliques.',
   'Atelier technique',
   '2027-01-15 09:00:00+01', '2027-01-15 12:00:00+01', 5, 10, 'scheduled',
   '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- INSCRIPTIONS AUX ATELIERS
-- ============================================================
INSERT INTO public.registrations (user_id, workshop_id, status) VALUES
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'confirmed'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'confirmed'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'confirmed'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'waitlisted'),
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'pending');

-- ============================================================
-- CRÉNEAUX DE PERMANENCE
-- ============================================================
INSERT INTO public.shifts (id, title, starts_at, ends_at, location, max_volunteers, status, created_by) VALUES
  ('20000000-0000-0000-0000-000000000001',
   'Permanence accueil',
   '2026-11-01 10:00:00+01', '2026-11-01 13:00:00+01',
   'Accueil', 3, 'open', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002',
   'Tri des dons',
   '2026-11-05 14:00:00+01', '2026-11-05 17:00:00+01',
   'Réserve', 2, 'open', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003',
   'Mise en rayon',
   '2026-11-08 10:00:00+01', '2026-11-08 12:00:00+01',
   'Boutique', 2, 'open', '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- BÉNÉVOLES PAR CRÉNEAU
-- ============================================================
INSERT INTO public.shift_volunteers (shift_id, user_id, status) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'confirmed'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'confirmed'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'confirmed');

