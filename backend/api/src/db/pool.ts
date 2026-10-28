import { Pool, QueryResultRow } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquant dans .env')
}

/**
 * Pool de connexions PostgreSQL.
 * Utilise DATABASE_URL au format postgresql://user:password@host:port/dbname
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,               // maximum 10 connexions simultanées
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

/** Helper : exécute une requête paramétrée et retourne les lignes */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query<T>(text, params)
  return result.rows
}

/** Helper : récupère une seule ligne ou null */
export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await pool.query<T>(text, params)
  return result.rows[0] ?? null
}

