import { Router, Request, Response } from 'express'
import { query, queryOne } from '../db/pool'
import { requireAuth, requireAdmin, requireVolunteer } from '../middleware/auth'

const router = Router()

// ---------------------------------------------------------------------------
// GET /api/shifts — Liste des permanences (utilisateurs connectés)
// ---------------------------------------------------------------------------
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const shifts = await query(
    `SELECT
       s.id, s.title, s.description, s.starts_at, s.ends_at, s.location, s.max_volunteers, s.status,
       COUNT(sv.id) FILTER (WHERE sv.status = 'confirmed') AS volunteers_count,
       s.max_volunteers - COUNT(sv.id) FILTER (WHERE sv.status = 'confirmed') AS spots_left
     FROM public.shifts s
     LEFT JOIN public.shift_volunteers sv ON sv.shift_id = s.id
     WHERE s.status != 'cancelled'
     GROUP BY s.id
     ORDER BY s.starts_at ASC`
  )

  res.json(shifts)
})

// ---------------------------------------------------------------------------
// GET /api/shifts/mine — Mes permanences
// ---------------------------------------------------------------------------
router.get('/mine', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const shifts = await query(
    `SELECT
       s.id, s.title, s.description, s.starts_at, s.ends_at, s.location,
       sv.status AS my_status
     FROM public.shift_volunteers sv
     JOIN public.shifts s ON s.id = sv.shift_id
     WHERE sv.user_id = $1 AND sv.status = 'confirmed'
     ORDER BY s.starts_at ASC`,
    [req.user!.userId]
  )

  res.json(shifts)
})

// ---------------------------------------------------------------------------
// POST /api/shifts/:id/join — Rejoindre un créneau
// ---------------------------------------------------------------------------
router.post('/:id/join', requireAuth, requireVolunteer, async (req: Request, res: Response): Promise<void> => {
  const shiftId = req.params.id
  const userId = req.user!.userId

  // Vérifie que le shift est 'open' et calcule les places restantes
  const shift = await queryOne<{ id: string; spots_left: string }>(
    `SELECT s.id,
       (s.max_volunteers - COUNT(sv.id) FILTER (WHERE sv.status = 'confirmed'))::int AS spots_left
     FROM public.shifts s
     LEFT JOIN public.shift_volunteers sv ON sv.shift_id = s.id
     WHERE s.id = $1 AND s.status = 'open'
     GROUP BY s.id`,
    [shiftId]
  )

  if (!shift) {
    res.status(404).json({ error: 'Créneau introuvable ou complet.' })
    return
  }

  if (Number(shift.spots_left) <= 0) {
    res.status(409).json({ error: 'Créneau complet.' })
    return
  }

  // Idempotent : si déjà inscrit, renvoie l'existant
  const existing = await queryOne<{ id: string; status: string }>(
    'SELECT id, status FROM public.shift_volunteers WHERE shift_id = $1 AND user_id = $2',
    [shiftId, userId]
  )

  if (existing) {
    res.json({ volunteer_id: existing.id, status: existing.status })
    return
  }

  const volunteer = await queryOne<{ id: string; status: string }>(
    `INSERT INTO public.shift_volunteers (shift_id, user_id, status)
     VALUES ($1, $2, 'confirmed')
     RETURNING id, status`,
    [shiftId, userId]
  )

  // Si c'était la dernière place, passe le shift à 'full'
  const remaining = Number(shift.spots_left) - 1
  if (remaining === 0) {
    await queryOne("UPDATE public.shifts SET status = 'full' WHERE id = $1", [shiftId])
  }

  res.status(201).json({ volunteer_id: volunteer!.id, status: volunteer!.status })
})

// ---------------------------------------------------------------------------
// DELETE /api/shifts/:id/leave — Quitter un créneau
// ---------------------------------------------------------------------------
router.delete('/:id/leave', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const deleted = await queryOne(
    'DELETE FROM public.shift_volunteers WHERE shift_id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.userId]
  )

  if (!deleted) {
    res.status(404).json({ error: 'Vous n\'êtes pas inscrit à ce créneau.' })
    return
  }

  // Si le shift était 'full', repasse à 'open'
  await queryOne(
    "UPDATE public.shifts SET status = 'open' WHERE id = $1 AND status = 'full'",
    [req.params.id]
  )

  res.json({ success: true })
})

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, starts_at, ends_at, location, max_volunteers } = req.body as Record<string, unknown>

  if (!starts_at || !ends_at) {
    res.status(400).json({ error: 'starts_at et ends_at sont obligatoires.' })
    return
  }

  const shift = await queryOne(
    `INSERT INTO public.shifts (title, description, starts_at, ends_at, location, max_volunteers, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title ?? 'Permanence', description ?? null, starts_at, ends_at, location ?? null, max_volunteers ?? 3, req.user!.userId]
  )

  res.status(201).json(shift)
})

router.patch('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, starts_at, ends_at, location, max_volunteers, status } = req.body as Record<string, unknown>

  const shift = await queryOne(
    `UPDATE public.shifts
     SET
       title         = COALESCE($1, title),
       description   = COALESCE($2, description),
       starts_at     = COALESCE($3, starts_at),
       ends_at       = COALESCE($4, ends_at),
       location      = COALESCE($5, location),
       max_volunteers= COALESCE($6, max_volunteers),
       status        = COALESCE($7, status),
       updated_at    = NOW()
     WHERE id = $8
     RETURNING *`,
    [title ?? null, description ?? null, starts_at ?? null, ends_at ?? null, location ?? null, max_volunteers ?? null, status ?? null, req.params.id]
  )

  if (!shift) {
    res.status(404).json({ error: 'Créneau introuvable.' })
    return
  }

  res.json(shift)
})

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const result = await queryOne('DELETE FROM public.shifts WHERE id = $1 RETURNING id', [req.params.id])

  if (!result) {
    res.status(404).json({ error: 'Créneau introuvable.' })
    return
  }

  res.status(204).send()
})

export default router

