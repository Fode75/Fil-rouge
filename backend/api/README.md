# API REST Ressourcerie — Express.js + PostgreSQL

## Structure

```
backend/api/
├── src/
│   ├── index.ts            ← Point d'entrée Express
│   ├── db/pool.ts          ← Connexion PostgreSQL (node-postgres)
│   ├── middleware/
│   │   ├── auth.ts         ← JWT : requireAuth, requireAdmin, requireVolunteer
│   │   └── errorHandler.ts ← Gestion centralisée des erreurs
│   └── routes/
│       ├── auth.ts         ← POST /api/auth/login, /register
│       ├── items.ts        ← GET/POST/PATCH/DELETE /api/items
│       ├── workshops.ts    ← GET/POST/PATCH/DELETE + /register
│       ├── registrations.ts ← GET /mine, DELETE, PATCH /status
│       ├── shifts.ts       ← GET, /mine, POST /join, DELETE /leave
│       └── users.ts        ← GET /me, PATCH, admin: GET all, PATCH role/active
├── sql/
│   ├── schema.sql          ← Toutes les tables (pas de dépendance Supabase)
│   └── seed.sql            ← Données de démo (mdp: "password123")
├── .env.example
├── package.json
└── tsconfig.json
```

## Endpoints de l'API

### Auth
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | — | Créer un compte |
| POST | `/api/auth/login` | — | Se connecter → retourne JWT |

### Items
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/items` | optionnel | Liste (filtres: category, status, search) |
| GET | `/api/items/:id` | — | Détail |
| POST | `/api/items` | admin | Créer |
| PATCH | `/api/items/:id` | admin | Modifier |
| DELETE | `/api/items/:id` | admin | Supprimer |

### Workshops
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/workshops` | — | Ateliers scheduled + spots_left |
| GET | `/api/workshops/:id` | — | Détail |
| POST | `/api/workshops/:id/register` | auth | S'inscrire (gestion liste d'attente) |
| GET | `/api/workshops/admin/all` | admin | Tous les ateliers |
| POST | `/api/workshops` | admin | Créer |
| PATCH | `/api/workshops/:id` | admin | Modifier |
| DELETE | `/api/workshops/:id` | admin | Supprimer |

### Registrations
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/registrations/mine` | auth | Mes inscriptions |
| DELETE | `/api/registrations/:id` | auth | Annuler (+ promotion liste d'attente) |
| GET | `/api/registrations` | admin | Toutes avec détails |
| PATCH | `/api/registrations/:id/status` | admin | Modifier statut |

### Shifts
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/shifts` | auth | Permanences disponibles |
| GET | `/api/shifts/mine` | auth | Mes permanences |
| POST | `/api/shifts/:id/join` | volunteer/admin | Rejoindre |
| DELETE | `/api/shifts/:id/leave` | auth | Quitter |
| POST/PATCH/DELETE | `/api/shifts` | admin | CRUD |

### Users
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/users/me` | auth | Mon profil |
| PATCH | `/api/users/me` | auth | Modifier mon profil |
| GET | `/api/users` | admin | Tous les utilisateurs |
| PATCH | `/api/users/:id/role` | admin | Changer rôle |
| PATCH | `/api/users/:id/active` | admin | Activer/désactiver |

## Démarrage

### 1. Base de données (pgAdmin)

1. Ouvre pgAdmin, crée une base de données nommée `ressourcerie`
2. Ouvre le **Query Tool** sur cette base
3. Exécute `sql/schema.sql` → toutes les tables créées
4. Exécute `sql/seed.sql` → données de démo insérées

### 2. Variables d'environnement

```bash
cp .env.example .env
# Édite .env avec ton mot de passe PostgreSQL
```

```env
DATABASE_URL=postgresql://postgres:TON_MDP@localhost:5432/ressourcerie
PORT=3001
JWT_SECRET=un_secret_long_et_aleatoire
CORS_ORIGIN=http://localhost:5173
```

### 3. Démarrer l'API

```bash
npm install
npm run dev
```

L'API tourne sur `http://localhost:3001`. Test rapide :
```bash
curl http://localhost:3001/health
# → {"status":"ok","timestamp":"..."}
```

### 4. Se connecter en tant qu'admin

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ressourcerie.fr","password":"password123"}'
```

Récupère le JWT et utilise-le dans tes requêtes protégées :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

