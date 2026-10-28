import { Request, Response, NextFunction } from 'express'

/** Gestion centralisée des erreurs non capturées */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[API Error]', err)

  if (err instanceof Error) {
    // Erreur de contrainte d'unicité PostgreSQL (ex: email déjà utilisé)
    const pgErr = err as Error & { code?: string; detail?: string }
    if (pgErr.code === '23505') {
      res.status(409).json({ error: 'Doublon détecté.', detail: pgErr.detail })
      return
    }
    // Erreur de clé étrangère
    if (pgErr.code === '23503') {
      res.status(400).json({ error: 'Référence invalide.', detail: pgErr.detail })
      return
    }
  }

  res.status(500).json({ error: 'Erreur interne du serveur.' })
}

