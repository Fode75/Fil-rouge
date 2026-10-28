import { Router, Request, Response } from 'express'
import { query, queryOne } from '../db/pool'
import { requireAuth, requireAdmin } from '../middleware/auth'

const router = Router()

// ---------------------------------------------------------------------------
// GET /api/users/me — Mon profil
// ---------------------------------------------------------------------------
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const profile = await queryOne(
    `SELECT id, email, first_name, last_name, phone, role, avatar_url, newsletter, is_active, created_at
     FROM public.profiles WHERE id = $1`,
    [req.user!.userId]
  )

  if (!profile) {
    res.status(404).json({ error: 'Profil introuvable.' })
    return
  }

  res.json(profile)
})

// ---------------------------------------------------------------------------
// PATCH /api/users/me — Mettre à jour mon profil
// ---------------------------------------------------------------------------
router.patch('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { first_name, last_name, phone, newsletter, avatar_url } = req.body as {
    first_name?: string
    last_name?: string
    phone?: string
    newsletter?: boolean
    avatar_url?: string
  }

  const profile = await queryOne(
    `UPDATE public.profiles
     SET
       first_name = COALESCE($1, first_name),
       last_name  = COALESCE($2, last_name),
       phone      = COALESCE($3, phone),
       newsletter = COALESCE($4, newsletter),
       avatar_url = COALESCE($5, avatar_url),
       updated_at = NOW()
     WHERE id = $6
     RETURNING id, email, first_name, last_name, phone, role, avatar_url, newsletter, is_active`,
    [first_name ?? null, last_name ?? null, phone ?? null, newsletter ?? null, avatar_url ?? null, req.user!.userId]
  )

  res.json(profile)
})

// ---------------------------------------------------------------------------
// Admin : GET /api/users — Liste de tous les utilisateurs
// ---------------------------------------------------------------------------
router.get('/', requireAuth, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const users = await query(
    `SELECT id, email, first_name, last_name, phone, role, avatar_url, newsletter, is_active, created_at
     FROM public.profiles
     ORDER BY created_at DESC`
  )

  res.json(users)
})

// ---------------------------------------------------------------------------
// Admin : PATCH /api/users/:id/role — Changer le rôle d'un utilisateur
// ---------------------------------------------------------------------------
router.patch('/:id/role', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { role } = req.body as { role?: string }

  if (!role || !['admin', 'member', 'volunteer'].includes(role)) {
    res.status(400).json({ error: "role doit être 'admin', 'member' ou 'volunteer'." })
    return
  }

  const user = await queryOne(
    `UPDATE public.profiles SET role = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, email, role`,
    [role, req.params.id]
  )

  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable.' })
    return
  }

  res.json(user)
})

// ---------------------------------------------------------------------------
// Admin : PATCH /api/users/:id/active — Activer / désactiver un compte
// ---------------------------------------------------------------------------
router.patch('/:id/active', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { is_active } = req.body as { is_active?: boolean }

  if (typeof is_active !== 'boolean') {
    res.status(400).json({ error: 'is_active doit être un booléen.' })
    return
  }

  const user = await queryOne(
    `UPDATE public.profiles SET is_active = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, email, is_active`,
    [is_active, req.params.id]
  )

  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable.' })
    return
  }

  res.json(user)
})

// ---------------------------------------------------------------------------
// POST /api/users/unsubscribe — Désinscription newsletter
// ---------------------------------------------------------------------------
router.post('/unsubscribe', async (req: Request, res: Response): Promise<void> => {
  const { token, email } = req.body as { token?: string; email?: string }
  const identifier = email || token

  if (!identifier) {
    res.status(400).json({ error: 'Email ou identifiant de désinscription manquant.' })
    return
  }

  await query(
    `UPDATE public.profiles SET newsletter = false, updated_at = NOW() WHERE email = $1 OR id::text = $1`,
    [identifier]
  )

  res.json({ success: true, message: 'Désinscription effectuée avec succès.' })
})

export default router

