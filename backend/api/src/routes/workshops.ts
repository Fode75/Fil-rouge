import { Router, Request, Response } from 'express'
import { query, queryOne } from '../db/pool'
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth'

const router = Router()

// ---------------------------------------------------------------------------
// GET /api/workshops — Liste publique avec places restantes
// ---------------------------------------------------------------------------
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const workshops = await query(
    `SELECT
       w.id, w.title, w.description, w.short_desc, w.cover_url, w.location,
       w.starts_at, w.ends_at, w.max_capacity, w.price, w.status, w.tags,
       w.max_capacity - COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS spots_left,
       COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS spots_taken
     FROM public.workshops w
     LEFT JOIN public.registrations r ON r.workshop_id = w.id
     WHERE w.status = 'scheduled'
     GROUP BY w.id
     ORDER BY w.starts_at ASC`
  )

  res.json(workshops)
})

// ---------------------------------------------------------------------------
// GET /api/workshops/:id — Détail d'un atelier
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const workshop = await queryOne(
    `SELECT
       w.id, w.title, w.description, w.short_desc, w.cover_url, w.location,
       w.starts_at, w.ends_at, w.max_capacity, w.price, w.status, w.tags,
       w.max_capacity - COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS spots_left,
       COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS spots_taken
     FROM public.workshops w
     LEFT JOIN public.registrations r ON r.workshop_id = w.id
     WHERE w.id = $1
     GROUP BY w.id`,
    [req.params.id]
  )

  if (!workshop) {
    res.status(404).json({ error: 'Atelier introuvable.' })
    return
  }

  res.json(workshop)
})

// ---------------------------------------------------------------------------
// POST /api/workshops/:id/register — S'inscrire à un atelier
// ---------------------------------------------------------------------------
router.post('/:id/register', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const workshopId = req.params.id
  let userId = req.user?.userId

  if (!userId) {
    const { email, name } = req.body as { email?: string; name?: string }
    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Veuillez vous connecter ou renseigner votre email.' })
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    let profile = await queryOne<{ id: string }>('SELECT id FROM public.profiles WHERE email = $1', [cleanEmail])

    if (!profile) {
      const parts = (name || '').trim().split(' ')
      const firstName = parts[0] || null
      const lastName = parts.slice(1).join(' ') || null

      profile = await queryOne<{ id: string }>(
        `INSERT INTO public.profiles (email, password_hash, first_name, last_name, role)
         VALUES ($1, '', $2, $3, 'member')
         RETURNING id`,
        [cleanEmail, firstName, lastName]
      )
    }

    userId = profile!.id
  }

  // Vérifie que l'atelier est 'scheduled'
  const workshop = await queryOne<{ id: string; max_capacity: number; spots_left: string }>(
    `SELECT w.id, w.max_capacity,
       (w.max_capacity - COUNT(r.id) FILTER (WHERE r.status = 'confirmed'))::int AS spots_left
     FROM public.workshops w
     LEFT JOIN public.registrations r ON r.workshop_id = w.id
     WHERE w.id = $1 AND w.status = 'scheduled'
     GROUP BY w.id`,
    [workshopId]
  )

  if (!workshop) {
    res.status(404).json({ error: "Atelier introuvable ou non disponible à l'inscription." })
    return
  }

  // Vérifie si déjà inscrit
  const existing = await queryOne<{ id: string; status: string }>(
    'SELECT id, status FROM public.registrations WHERE user_id = $1 AND workshop_id = $2',
    [userId, workshopId]
  )

  if (existing) {
    res.json({ registration_id: existing.id, status: existing.status, already_registered: true })
    return
  }

  // Détermine le statut : confirmé ou liste d'attente
  const spotsLeft = Number(workshop.spots_left)
  const status = spotsLeft > 0 ? 'confirmed' : 'waitlisted'

  const registration = await queryOne<{ id: string; status: string }>(
    `INSERT INTO public.registrations (user_id, workshop_id, status)
     VALUES ($1, $2, $3)
     RETURNING id, status`,
    [userId, workshopId, status]
  )

  res.status(201).json({ registration_id: registration!.id, status: registration!.status })
})

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

// GET /api/workshops/admin/all — Tous les ateliers (admin)
router.get('/admin/all', requireAuth, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const workshops = await query(
    `SELECT w.*,
       COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed_count
     FROM public.workshops w
     LEFT JOIN public.registrations r ON r.workshop_id = w.id
     GROUP BY w.id
     ORDER BY w.starts_at DESC`
  )
  res.json(workshops)
})

// POST /api/workshops — Créer un atelier (admin)
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, short_desc, cover_url, location, starts_at, ends_at, max_capacity, price, status, tags } = req.body as Record<string, unknown>

  if (!title || !starts_at || !ends_at || !max_capacity) {
    res.status(400).json({ error: 'title, starts_at, ends_at et max_capacity sont obligatoires.' })
    return
  }

  const workshop = await queryOne(
    `INSERT INTO public.workshops
       (title, description, short_desc, cover_url, location, starts_at, ends_at, max_capacity, price, status, tags, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [title, description ?? null, short_desc ?? null, cover_url ?? null, location ?? null,
     starts_at, ends_at, max_capacity, price ?? 0, status ?? 'scheduled', tags ?? [], req.user!.userId]
  )

  res.status(201).json(workshop)
})

// PATCH /api/workshops/:id — Modifier un atelier (admin)
router.patch('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, short_desc, cover_url, location, starts_at, ends_at, max_capacity, price, status, tags } = req.body as Record<string, unknown>

  const workshop = await queryOne(
    `UPDATE public.workshops
     SET
       title        = COALESCE($1, title),
       description  = COALESCE($2, description),
       short_desc   = COALESCE($3, short_desc),
       cover_url    = COALESCE($4, cover_url),
       location     = COALESCE($5, location),
       starts_at    = COALESCE($6, starts_at),
       ends_at      = COALESCE($7, ends_at),
       max_capacity = COALESCE($8, max_capacity),
       price        = COALESCE($9, price),
       status       = COALESCE($10, status),
       tags         = COALESCE($11, tags),
       updated_at   = NOW()
     WHERE id = $12
     RETURNING *`,
    [title ?? null, description ?? null, short_desc ?? null, cover_url ?? null, location ?? null,
     starts_at ?? null, ends_at ?? null, max_capacity ?? null, price ?? null, status ?? null, tags ?? null,
     req.params.id]
  )

  if (!workshop) {
    res.status(404).json({ error: 'Atelier introuvable.' })
    return
  }

  res.json(workshop)
})

// DELETE /api/workshops/:id — Supprimer un atelier (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const result = await queryOne('DELETE FROM public.workshops WHERE id = $1 RETURNING id', [req.params.id])

  if (!result) {
    res.status(404).json({ error: 'Atelier introuvable.' })
    return
  }

  res.status(204).send()
})

export default router

