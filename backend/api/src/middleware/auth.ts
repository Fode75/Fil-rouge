import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { queryOne } from '../db/pool'

export interface JwtPayload {
  userId: string
  role: 'admin' | 'member' | 'volunteer'
}

// Étend le type Request d'Express pour inclure l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/** Vérifie le JWT dans le header Authorization: Bearer <token> */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide.' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide.' })
  }
}

/** Vérifie que l'utilisateur authentifié est admin */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Non authentifié.' })
    return
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Accès réservé aux administrateurs.' })
    return
  }
  next()
}

/** Vérifie que l'utilisateur est bénévole ou admin */
export function requireVolunteer(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Non authentifié.' })
    return
  }
  if (req.user.role !== 'volunteer' && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Accès réservé aux bénévoles.' })
    return
  }
  next()
}

/** Génère un JWT pour un utilisateur */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
  })
}

/** Optionnel : charge le profil complet de l'utilisateur en req.user si token présent */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next()
    return
  }
  try {
    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const profile = await queryOne<{ role: 'admin' | 'member' | 'volunteer' }>(
      'SELECT role FROM public.profiles WHERE id = $1',
      [payload.userId]
    )
    if (profile) {
      req.user = { userId: payload.userId, role: profile.role }
    }
  } catch {
    // Token invalide → on continue sans user (accès public)
  }
  next()
}

