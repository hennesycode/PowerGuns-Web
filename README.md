# Power Guns Polígono S.A.S. — Full Stack App

Next.js + TypeScript + Tailwind CSS + shadcn/ui + Prisma + MySQL

## Requisitos

- Node.js 22+
- Docker Desktop o MySQL 8.4+
- npm

## Setup rápido

```bash
cp .env.example .env
npm install
```

## Base de datos

```bash
# Con Docker
docker compose up -d mysql

# O usa MySQL local y ajusta DATABASE_URL en .env
```

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Docker completo

```bash
docker compose up -d
```

## Estructura

```
src/
├── app/              # App Router (pages, layout, api routes)
├── components/       # UI components (home, layout, shared, ui)
├── lib/              # Utils, prisma, validations, constants
├── server/           # Server actions + service layer
├── types/            # TypeScript types
```

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend:** Next.js API Routes, Prisma 7, MySQL 8.4
- **Validation:** Zod
- **Infra:** Docker, docker-compose
