# Code Route — Application complete

Plateforme de preparation au code de la route avec methode structuree.

## Stack
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth v4
- Stripe

## Installation

```bash
cp .env.example .env
npm install
npm run db:push
npm run seed
npm run dev
```

## Variables d'environnement

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/code_route
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=secret-aleatoire
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Pages

| URL | Description |
|-----|-------------|
| / | Landing page |
| /auth/register | Inscription |
| /auth/login | Connexion |
| /dashboard | Dashboard eleve |
| /quiz | Series de questions |
| /exam | Examen blanc 40 questions |
| /traps | Questions pieges |
| /readiness | Score de preparation |
| /pricing | Tarifs + Stripe |
| /booking | Reserver l'examen |
| /admin | Admin (role admin requis) |

## Compte admin

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'ton@email.com';
```

## Deploiement

```bash
npm run build
npm run start
```
