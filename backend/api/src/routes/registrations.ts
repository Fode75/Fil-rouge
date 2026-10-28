import { Router, Request, Response } from 'express'
import { query, queryOne } from '../db/pool'
import { requireAuth, requireAdmin } from '../middleware/auth'

const router = Router()

// ---------------------------------------------------------------------------
// GET /api/registrations/mine — Mes inscriptions
// ---------------------------------------------------------------------------
router.get('/mine', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const registrations = await query(
    `SELECT
       r.id, r.status, r.notes, r.created_at,
       r.workshop_id,
       w.title AS workshop_title,
       w.starts_at
     FROM public.registrations r
     JOIN public.workshops w ON w.id = r.workshop_id
     WHERE r.user_id = $1 AND r.status != 'cancelled'
     ORDER BY r.created_at DESC`,
    [req.user!.userId]
  )

  res.json(registrations)
})

// ---------------------------------------------------------------------------
// DELETE /api/registrations/:id — Annuler une inscription
// ---------------------------------------------------------------------------
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  // Récupère la registration (doit appartenir à l'user ou être admin)
  const registration = await queryOne<{
    id: string
    user_id: string
    workshop_id: string
    status: string
  }>(
    'SELECT id, user_id, workshop_id, status FROM public.registrations WHERE id = $1',
    [req.params.id]
  )

  if (!registration) {
    res.status(404).json({ error: 'Inscription introuvable.' })
    return
  }

  const isOwner = registration.user_id === req.user!.userId
  const isAdmin = req.user!.role === 'admin'

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: "Vous ne pouvez pas annuler l'inscription d'un autre utilisateur." })
    return
  }

  // Annulation
  await queryOne(
    `UPDATE public.registrations SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
    [req.params.id]
  )

  // Si la registration était 'confirmed', promouvoir le premier sur liste d'attente
  if (registration.status === 'confirmed') {
    const next = await queryOne<{ id: string }>(
      `SELECT id FROM public.registrations
       WHERE workshop_id = $1 AND status = 'waitlisted'
       ORDER BY created_at ASC LIMIT 1`,
      [registration.workshop_id]
    )
    if (next) {
      await queryOne(
        `UPDATE public.registrations SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
        [next.id]
      )
    }
  }

  res.json({ success: true })
})

// ---------------------------------------------------------------------------
// Admin : GET /api/registrations — Toutes les inscriptions enrichies
// ---------------------------------------------------------------------------
router.get('/', requireAuth, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const registrations = await query(
    `SELECT
       r.id, r.status, r.notes, r.created_at, r.updated_at,
       r.user_id,
       p.first_name, p.last_name, p.email,
       r.workshop_id,
       w.title AS workshop_title,
       w.starts_at AS workshop_starts_at
     FROM public.registrations r
     JOIN public.profiles p ON p.id = r.user_id
     JOIN public.workshops w ON w.id = r.workshop_id
     ORDER BY r.created_at DESC`
  )

  res.json(registrations)
})

// Admin : PATCH /api/registrations/:id/status — Modifier le statut d'une inscription
router.patch('/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status?: string }

  if (!status) {
    res.status(400).json({ error: 'status obligatoire.' })
    return
  }

  const registration = await queryOne(
    `UPDATE public.registrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  )

  if (!registration) {
    res.status(404).json({ error: 'Inscription introuvable.' })
    return
  }

  res.json(registration)
})

export default router

