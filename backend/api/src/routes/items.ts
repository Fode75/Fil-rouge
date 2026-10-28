import { Router, Request, Response } from 'express'
import { query, queryOne } from '../db/pool'
import { requireAuth, requireAdmin } from '../middleware/auth'

const router = Router()

// ---------------------------------------------------------------------------
// GET /api/items — Liste publique (available uniquement pour anonymes)
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category, status, search } = req.query as {
    category?: string
    status?: string
    search?: string
  }

  // Si l'utilisateur est connecté (token valide), il voit tout
  // Sinon il ne voit que les objets "available"
  const isAuth = !!req.headers.authorization

  const conditions: string[] = []
  const params: unknown[] = []

  if (!isAuth) {
    conditions.push(`status = 'available'`)
  } else if (status) {
    params.push(status)
    conditions.push(`status = $${params.length}`)
  }

  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    conditions.push(`title ILIKE $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const items = await query(
    `SELECT id, title, description, category, status, price, image_urls, condition, tags, created_at
     FROM public.items
     ${where}
     ORDER BY created_at DESC`,
    params
  )

  res.json(items)
})

// ---------------------------------------------------------------------------
// GET /api/items/:id — Détail d'un objet
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const item = await queryOne(
    `SELECT id, title, description, category, status, price, image_urls, condition, tags, created_at
     FROM public.items WHERE id = $1`,
    [req.params.id]
  )

  if (!item) {
    res.status(404).json({ error: 'Objet introuvable.' })
    return
  }

  res.json(item)
})

// ---------------------------------------------------------------------------
// POST /api/items — Créer un objet (admin)
// ---------------------------------------------------------------------------
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, category, status, price, condition, tags } = req.body as {
    title?: string
    description?: string
    category?: string
    status?: string
    price?: number
    condition?: string
    tags?: string[]
  }

  if (!title || !category) {
    res.status(400).json({ error: 'title et category sont obligatoires.' })
    return
  }

  const item = await queryOne(
    `INSERT INTO public.items (title, description, category, status, price, condition, tags, added_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, description ?? null, category, status ?? 'available', price ?? null, condition ?? null, tags ?? [], req.user!.userId]
  )

  res.status(201).json(item)
})

// ---------------------------------------------------------------------------
// PATCH /api/items/:id — Modifier un objet (admin)
// ---------------------------------------------------------------------------
router.patch('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, category, status, price, condition, tags } = req.body as Record<string, unknown>

  const item = await queryOne(
    `UPDATE public.items
     SET
       title       = COALESCE($1, title),
       description = COALESCE($2, description),
       category    = COALESCE($3, category),
       status      = COALESCE($4, status),
       price       = COALESCE($5, price),
       condition   = COALESCE($6, condition),
       tags        = COALESCE($7, tags),
       updated_at  = NOW()
     WHERE id = $8
     RETURNING *`,
    [title ?? null, description ?? null, category ?? null, status ?? null, price ?? null, condition ?? null, tags ?? null, req.params.id]
  )

  if (!item) {
    res.status(404).json({ error: 'Objet introuvable.' })
    return
  }

  res.json(item)
})

// ---------------------------------------------------------------------------
// DELETE /api/items/:id — Supprimer un objet (admin)
// ---------------------------------------------------------------------------
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const result = await queryOne(
    'DELETE FROM public.items WHERE id = $1 RETURNING id',
    [req.params.id]
  )

  if (!result) {
    res.status(404).json({ error: 'Objet introuvable.' })
    return
  }

  res.status(204).send()
})

export default router

