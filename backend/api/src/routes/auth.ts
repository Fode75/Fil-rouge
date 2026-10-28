import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { query, queryOne } from '../db/pool'
import { signToken } from '../middleware/auth'

const router = Router()

// ---------------------------------------------------------------------------
// POST /api/auth/register — Inscription
// ---------------------------------------------------------------------------
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, first_name, last_name } = req.body as {
    email?: string
    password?: string
    first_name?: string
    last_name?: string
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe obligatoires.' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères.' })
    return
  }

  const existingUser = await queryOne('SELECT id FROM public.profiles WHERE email = $1', [email])
  if (existingUser) {
    res.status(409).json({ error: 'Cet email est déjà utilisé.' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  // Génère un UUID côté app (PostgreSQL a uuid-ossp mais aussi gen_random_uuid())
  const rows = await query<{ id: string; role: string }>(
    `INSERT INTO public.profiles (id, email, password_hash, first_name, last_name)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)
     RETURNING id, role`,
    [email, passwordHash, first_name ?? null, last_name ?? null]
  )

  const profile = rows[0]
  const token = signToken({ userId: profile.id, role: profile.role as 'admin' | 'member' | 'volunteer' })

  res.status(201).json({ token, role: profile.role })
})

// ---------------------------------------------------------------------------
// POST /api/auth/login — Connexion
// ---------------------------------------------------------------------------
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe obligatoires.' })
    return
  }

  const profile = await queryOne<{
    id: string
    role: string
    password_hash: string
    first_name: string | null
    last_name: string | null
    is_active: boolean
  }>(
    'SELECT id, role, password_hash, first_name, last_name, is_active FROM public.profiles WHERE email = $1',
    [email]
  )

  if (!profile) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
    return
  }

  if (!profile.is_active) {
    res.status(403).json({ error: 'Compte désactivé. Contactez un administrateur.' })
    return
  }

  const valid = await bcrypt.compare(password, profile.password_hash)
  if (!valid) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
    return
  }

  const token = signToken({ userId: profile.id, role: profile.role as 'admin' | 'member' | 'volunteer' })

  res.json({
    token,
    user: {
      id: profile.id,
      role: profile.role,
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
  })
})

export default router

