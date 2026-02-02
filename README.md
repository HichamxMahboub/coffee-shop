# Coffee Shop Management System

Application full-stack de gestion de café (dashboard, POS, inventaire, ventes).

## Stack
- Frontend : React + Tailwind + Vite
- Backend : Node.js + Express
- Base de données : PostgreSQL

## Installation

### 1) Base de données
Créer la base et appliquer le schéma :

```bash
createdb coffee_shop
psql coffee_shop < backend/database/setup.sql
psql coffee_shop < backend/seed.sql
```

Créer un admin automatiquement :

```bash
cd backend
ADMIN_EMAIL=hicham@test.ma ADMIN_PASSWORD=12344321 ADMIN_NAME="Hicham" node scripts/create-admin.js
```

Créer un utilisateur admin (exemple, à adapter) :

```bash
psql coffee_shop
```

```sql
INSERT INTO users (nom, email, role, password_hash)
VALUES (
  'Admin Café',
  'admin@cafe.com',
  'admin',
  '$2a$10$5xSxwQyV4lGzqR4J9aT3LuzR2nQ7pS8Z1DkQ2Q0d3kO2Xkqv4n9cq' -- mot de passe: admin123
);
```

### 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables d’environnement

Backend (`backend/.env`):

- `PORT=5000`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/coffee_shop`
- `JWT_SECRET=change-moi`
- `JWT_REFRESH_SECRET=change-moi-aussi`

Frontend (`frontend/.env` optionnel):

- `VITE_API_URL=http://localhost:5000/api`

## RBAC (Rôles)
- `admin` : accès complet.
- `barista` : accès KDS uniquement (`/barista`, statut des commandes).
- `cashier` : accès POS uniquement (produits, commandes, settings en lecture).

## Déploiement Vercel (Frontend)

Un fichier `frontend/vercel.json` est fourni pour le routage SPA.

1) Build & Output (Vercel)
- Framework: Vite
- Output: `dist`

2) Variables d’env (Vercel)
- `VITE_API_URL=https://<votre-backend>/api`

## Supabase (PostgreSQL)

1) Créer un projet Supabase, récupérer l’URI de connexion (Database URL).

2) Mettre à jour le backend:
```
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<db>
```

3) Appliquer les migrations:
```bash
psql "${DATABASE_URL}" < backend/database/setup.sql
psql "${DATABASE_URL}" < backend/database/migration.sql
```

4) Vérifier les connexions:
- Backend: `npm run dev`
- Frontend: `VITE_API_URL` pointe vers le backend déployé.

## Fonctionnalités
- Dashboard : ventes du jour, commandes, alertes stock bas
- POS : recherche, panier, TVA, encaissement
- Inventaire : gestion des ingrédients + alertes stock bas
- Ventes : historique + export CSV
- Auth : login sécurisé JWT

## Structure
```
/coffee shop
  /backend
  /frontend
```
