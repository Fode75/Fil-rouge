import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool } from './db/pool'
import { errorHandler } from './middleware/errorHandler'

import authRoutes from './routes/auth'
import itemsRoutes from './routes/items'
import workshopsRoutes from './routes/workshops'
import registrationsRoutes from './routes/registrations'
import shiftsRoutes from './routes/shifts'
import usersRoutes from './routes/users'

const app = express()
const PORT = process.env.PORT ?? 3001

// ---------------------------------------------------------------------------
// Middlewares globaux
// ---------------------------------------------------------------------------
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/auth',          authRoutes)
app.use('/api/items',         itemsRoutes)
app.use('/api/workshops',     workshopsRoutes)
app.use('/api/registrations', registrationsRoutes)
app.use('/api/shifts',        shiftsRoutes)
app.use('/api/users',         usersRoutes)

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable.' })
})

// Gestion centralisée des erreurs (doit être en DERNIER)
app.use(errorHandler)

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------
async function start() {
  // Vérifie la connexion BDD avant de démarrer
  try {
    await pool.query('SELECT 1')
    console.log('✅ Connexion PostgreSQL établie')
  } catch (err) {
    console.error('❌ Impossible de se connecter à PostgreSQL :', err)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`🚀 API Ressourcerie démarrée sur http://localhost:${PORT}`)
    console.log(`   Healthcheck : http://localhost:${PORT}/health`)
  })
}

start()

