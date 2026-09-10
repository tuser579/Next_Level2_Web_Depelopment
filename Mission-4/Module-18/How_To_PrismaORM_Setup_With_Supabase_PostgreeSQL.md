# 🟢 How to Set Up Prisma ORM with Supabase PostgreSQL — Step by Step

> **Stack:** Prisma ORM 7 · Supabase PostgreSQL · TypeScript · Node.js · `tsx` · `pg` driver adapter

---

## 📌 Table of Contents

1. [What is Supabase?](#1-what-is-supabase)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Create a Supabase Project & Database](#step-1--create-a-supabase-project--database)
4. [Step 2 — Get Your Connection Strings](#step-2--get-your-connection-strings)
5. [Step 3 — Initialize the Project](#step-3--initialize-the-project)
6. [Step 4 — Install Dependencies](#step-4--install-dependencies)
7. [Step 5 — Configure TypeScript & package.json](#step-5--configure-typescript--packagejson)
8. [Step 6 — Set Up the `.env` File](#step-6--set-up-the-env-file)
9. [Step 7 — Configure Prisma (`prisma7.config.ts`)](#step-7--configure-prisma-prisma7configts)
10. [Step 8 — Define Your Schema](#step-8--define-your-schema)
11. [Step 9 — Run Migrations](#step-9--run-migrations)
12. [Step 10 — Generate Prisma Client](#step-10--generate-prisma-client)
13. [Step 11 — Create the Prisma Client File](#step-11--create-the-prisma-client-file)
14. [Step 12 — Write Your First Query](#step-12--write-your-first-query)
15. [Step 13 — Run Your Script](#step-13--run-your-script)
16. [Supabase vs NeonDB vs Prisma Postgres — Comparison](#supabase-vs-neondb-vs-prisma-postgres--comparison)
17. [Full Project Structure](#full-project-structure)
18. [Troubleshooting](#troubleshooting)
19. [Reference Links](#reference-links)

---

## 1. What is Supabase?

**Supabase** is an open-source **Firebase alternative** built on top of PostgreSQL.  
It provides a managed PostgreSQL database plus Auth, Storage, Realtime, and Edge Functions — all in one platform.

| Feature             | Detail                                                 |
|---------------------|--------------------------------------------------------|
| Database type       | PostgreSQL (fully compatible)                          |
| Pricing             | Free tier — 500 MB DB, 2 projects                     |
| Connection modes    | Direct (port 5432) + Connection Pooler (port 6543)     |
| Extras              | Auth, Storage, Realtime, Edge Functions, REST API      |
| Regions             | AWS & Fly.io — multiple regions worldwide              |
| Console             | [supabase.com/dashboard](https://supabase.com/dashboard)|

> 💡 **Important for Prisma:** Supabase requires **two different connection strings**:
> - **`DATABASE_URL`** — Pooled connection (for app queries, via Supavisor on port `6543`)
> - **`DIRECT_URL`** — Direct connection (for migrations only, port `5432`)

---

## 2. Prerequisites

| Tool       | Minimum Version | Check command       |
|------------|-----------------|---------------------|
| Node.js    | v18+            | `node --version`    |
| npm        | v9+             | `npm --version`     |
| TypeScript | v5+             | `npx tsc --version` |

Sign up free at [supabase.com](https://supabase.com) — no credit card required.

---

## Step 1 — Create a Supabase Project & Database

### 1.1 Create Your Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Organization:** your org (or create one)
   - **Project name:** e.g. `my-prisma-app`
   - **Database Password:** set a strong password (**save this** — you'll need it)
   - **Region:** choose the closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes while Supabase provisions your database ☕

---

## Step 2 — Get Your Connection Strings

Supabase provides **two** connection strings — you need **both** for Prisma.

### How to Find Them

1. In your Supabase project dashboard → click **"Project Settings"** (gear icon)
2. Click **"Database"** in the left sidebar
3. Scroll down to **"Connection string"**
4. You'll see tabs: **URI**, **PSQL**, **SQLAlchemy**, etc. — choose **URI**

### Connection String 1 — Pooled (for queries) `DATABASE_URL`

Select **"Transaction mode"** (port `6543`):

```
postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Add `?pgbouncer=true&connection_limit=1` at the end:

```
postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Connection String 2 — Direct (for migrations) `DIRECT_URL`

Select **"Session mode"** or the **Direct** tab (port `5432`):

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres
```

> ⚠️ **Why two URLs?**
> - `DATABASE_URL` (pooled port `6543`) → used by your **running app** — handles many simultaneous connections efficiently via PgBouncer
> - `DIRECT_URL` (direct port `5432`) → used by **Prisma Migrate** — migrations need a direct, persistent connection

> 📚 **Docs:** [Supabase — Connect with Prisma](https://supabase.com/docs/guides/database/prisma)

---

## Step 3 — Initialize the Project

```bash
# Create a new project folder
mkdir my-supabase-prisma-app
cd my-supabase-prisma-app

# Initialize npm
npm init -y
```

---

## Step 4 — Install Dependencies

Supabase uses standard PostgreSQL, so we use the `pg` driver with `@prisma/adapter-pg`:

```bash
# ── Runtime dependencies ─────────────────────────────────────────
npm install @prisma/client @prisma/adapter-pg pg dotenv

# ── Dev dependencies ─────────────────────────────────────────────
npm install -D prisma typescript tsx @types/node @types/pg
```

### What Each Package Does

| Package              | Type    | Purpose                                                       |
|----------------------|---------|---------------------------------------------------------------|
| `@prisma/client`     | Runtime | Auto-generated Prisma Client for database queries             |
| `@prisma/adapter-pg` | Runtime | Prisma driver adapter for standard PostgreSQL via `pg`        |
| `pg`                 | Runtime | PostgreSQL client for Node.js (works with Supabase directly)  |
| `dotenv`             | Runtime | Loads `.env` variables into `process.env`                     |
| `prisma`             | Dev     | Prisma CLI — for migrations, schema, generate                 |
| `typescript`         | Dev     | TypeScript compiler                                           |
| `tsx`                | Dev     | Run TypeScript files directly without compiling               |
| `@types/node`        | Dev     | TypeScript types for Node.js built-ins                        |
| `@types/pg`          | Dev     | TypeScript types for the `pg` package                         |

---

## Step 5 — Configure TypeScript & package.json

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"],
    "outDir": "dist",
    "rootDir": "./"
  }
}
```

### `package.json`

```json
{
  "name": "my-supabase-prisma-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":      "tsx src/script.ts",
    "generate": "prisma generate",
    "migrate":  "prisma migrate dev",
    "studio":   "prisma studio"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.0.0",
    "@prisma/client":     "^7.0.0",
    "dotenv":             "^16.0.0",
    "pg":                 "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/pg":   "^8.0.0",
    "prisma":      "^7.0.0",
    "tsx":         "^4.0.0",
    "typescript":  "^5.0.0"
  }
}
```

---

## Step 6 — Set Up the `.env` File

Create `.env` in the **project root** — add **both** connection strings:

```env
# .env

# ── Pooled connection (for app queries) ──────────────────────────
# Port 6543 — Transaction mode via PgBouncer
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# ── Direct connection (for Prisma Migrate only) ──────────────────
# Port 5432 — bypasses the connection pooler
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres"
```

Replace:
- `xxxxxxxxxxxxxxxxxxxx` → your Supabase **project reference ID** (found in project settings)
- `[YOUR-PASSWORD]` → the database password you set when creating the project

> ⚠️ **NEVER commit `.env` to Git!** Add it to `.gitignore`:

```bash
# .gitignore
.env
node_modules/
dist/
generated/
```

### Understanding the Two URLs

```
DATABASE_URL  (pooled — port 6543)
  └─ postgresql://postgres.REF:PASS@REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
       Used by: PrismaClient (app queries) → PgBouncer pool → Supabase PostgreSQL

DIRECT_URL  (direct — port 5432)
  └─ postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres
       Used by: prisma migrate → Supabase PostgreSQL (no pooler)
```

> 📚 **Docs:** [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connection-management)

---

## Step 7 — Configure Prisma (`prisma7.config.ts`)

Create `prisma7.config.ts` in the project root:

```typescript
// prisma7.config.ts
import "dotenv/config";               // ← must be first — loads .env
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:       process.env["DATABASE_URL"],   // ← pooled (queries)
    directUrl: process.env["DIRECT_URL"],     // ← direct (migrations)
  },
});
```

> 💡 The `directUrl` tells Prisma Migrate to use the **direct connection** (port 5432)  
> even though the app uses the pooled connection for queries.

> 📚 **Docs:** [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)

---

## Step 8 — Define Your Schema

Initialize Prisma:

```bash
npx prisma init
```

Open `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"          // ← Prisma 7 generator name
  output   = "../generated/prisma"    // ← generated Client location
}

datasource db {
  provider = "postgresql"             // ← Supabase uses PostgreSQL
  // ✅ No url/directUrl here in Prisma 7
  // ✅ Both are configured in prisma7.config.ts → datasource
}

// ── Models ────────────────────────────────────────────────────────

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Prisma 6 vs Prisma 7 — Key Differences

| Feature              | Prisma 6 (old)                                  | Prisma 7 (new)                            |
|----------------------|-------------------------------------------------|-------------------------------------------|
| Generator provider   | `"prisma-client-js"`                            | `"prisma-client"`                         |
| `url` location       | `datasource` block in `schema.prisma`           | `prisma7.config.ts → datasource.url`      |
| `directUrl` location | `datasource` block in `schema.prisma`           | `prisma7.config.ts → datasource.directUrl`|
| Driver               | Built-in (no adapter needed)                    | `@prisma/adapter-pg` (required)           |

> 📚 **Docs:** [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)

---

## Step 9 — Run Migrations

```bash
npx prisma migrate dev --name init
```

What happens:
1. Reads `prisma7.config.ts` → gets `DIRECT_URL` (port 5432)
2. Connects directly to Supabase PostgreSQL (bypasses pooler)
3. Generates SQL in `prisma/migrations/`
4. Applies the SQL to your Supabase database
5. Auto-runs `prisma generate`

```bash
# ✅ Expected output:
# Environment variables loaded from .env
# Prisma schema loaded from prisma/schema.prisma
# Datasource "db": PostgreSQL database "postgres" at "db.xxx.supabase.co:5432"
# ✔  Generated migration 20240901000000_init
# ✔  The migration was applied successfully
```

### All Migration Commands

```bash
# Create + apply a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production / CI — no prompts)
npx prisma migrate deploy

# Reset the database ⚠️ drops all data
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Open Prisma Studio (browser DB GUI)
npx prisma studio
```

> 📚 **Docs:** [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)

---

## Step 10 — Generate Prisma Client

```bash
npx prisma generate
```

Generates the fully-typed Prisma Client from `prisma/schema.prisma` into `generated/prisma/`.

> 💡 `prisma migrate dev` runs `prisma generate` automatically.  
> Run it manually only when schema changes without a migration.

---

## Step 11 — Create the Prisma Client File

Create `src/lib/prisma.ts`:

```typescript
// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// Use the POOLED connection string for the app
const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({ connectionString });
const prisma  = new PrismaClient({ adapter });

export { prisma };
```

### Connection Flow

```
Your Code
   ↓
PrismaClient (with adapter)
   ↓
PrismaPg adapter  (@prisma/adapter-pg)
   ↓
pg driver
   ↓
PgBouncer Pooler  (port 6543 — via DATABASE_URL)
   ↓
Supabase PostgreSQL
```

> 📚 **Docs:** [Prisma Adapter for pg](https://www.prisma.io/docs/orm/overview/databases/database-drivers#pg)

---

## Step 12 — Write Your First Query

Create `src/script.ts`:

```typescript
// src/script.ts
import { prisma } from "./lib/prisma";

async function main() {
  // ── 1. Create a User with a Post ─────────────────────────────────
  const user = await prisma.user.create({
    data: {
      name:  "Alice",
      email: "alice@supabase.io",
      posts: {
        create: {
          title:     "Hello Supabase!",
          content:   "My first post with Prisma + Supabase!",
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log("✅ Created user:", JSON.stringify(user, null, 2));

  // ── 2. Create a standalone Post ───────────────────────────────────
  const post = await prisma.post.create({
    data: {
      authorId:  user.id,
      title:     "Second Post",
      content:   "Another post via Prisma + Supabase!",
      published: false,
    },
  });
  console.log("✅ Created post:", post);

  // ── 3. Fetch all users with their posts ───────────────────────────
  const allUsers = await prisma.user.findMany({
    include: { posts: true },
  });
  console.log("✅ All users:", JSON.stringify(allUsers, null, 2));

  // ── 4. Update — publish the draft post ───────────────────────────
  const updated = await prisma.post.update({
    where: { id: post.id },
    data:  { published: true },
  });
  console.log("✅ Updated post:", updated);

  // ── 5. Count all posts ────────────────────────────────────────────
  const totalPosts = await prisma.post.count();
  console.log("✅ Total posts:", totalPosts);

  // ── 6. Delete a post ──────────────────────────────────────────────
  await prisma.post.delete({ where: { id: post.id } });
  console.log("✅ Deleted post id:", post.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

---

## Step 13 — Run Your Script

```bash
npx tsx src/script.ts
```

Expected output:

```
✅ Created user: {
  "id": 1,
  "name": "Alice",
  "email": "alice@supabase.io",
  "posts": [
    {
      "id": 1,
      "title": "Hello Supabase!",
      "content": "My first post with Prisma + Supabase!",
      "published": true,
      "authorId": 1
    }
  ]
}
✅ Created post: { id: 2, title: 'Second Post', published: false, authorId: 1 }
✅ All users: [ ... ]
✅ Updated post: { id: 2, title: 'Second Post', published: true, authorId: 1 }
✅ Total posts: 2
✅ Deleted post id: 2
```

---

## Supabase vs NeonDB vs Prisma Postgres — Comparison

| Feature                | Supabase                          | NeonDB                              | Prisma Postgres                    |
|------------------------|-----------------------------------|-------------------------------------|------------------------------------|
| Provider               | Supabase (supabase.com)           | Neon (neon.tech)                    | Prisma (prisma.io)                 |
| Free tier              | ✅ 500 MB, 2 projects             | ✅ 0.5 GB, 1 project                | ✅ Limited free tier               |
| Connection             | Direct (5432) + Pooled (6543)     | Standard PostgreSQL                 | Standard PostgreSQL                |
| `.env` variables       | `DATABASE_URL` + `DIRECT_URL`     | `DATABASE_URL` only                 | `DATABASE_URL` only                |
| Driver package         | `pg`                              | `@neondatabase/serverless`          | `pg`                               |
| Prisma adapter         | `@prisma/adapter-pg`              | `@prisma/adapter-neon`              | `@prisma/adapter-pg`               |
| Extra features         | Auth, Storage, Realtime, API      | DB branching                        | Prisma-managed only                |
| Edge/Serverless ready  | ✅ (via pooler)                   | ✅ (HTTP mode)                      | ✅                                 |
| Open source            | ✅ Yes                            | ✅ Yes                              | ❌ Managed service                 |
| Best for               | Full-stack apps with auth/storage | Serverless, edge functions          | Prisma-native projects             |

---

## Full Project Structure

```
my-supabase-prisma-app/
│
├── prisma/
│   ├── schema.prisma              ← your data models
│   └── migrations/                ← auto-generated SQL files
│       └── 20240901000000_init/
│           └── migration.sql
│
├── generated/
│   └── prisma/                    ← generated Prisma Client (do not edit!)
│       └── client/
│
├── src/
│   ├── lib/
│   │   └── prisma.ts              ← PrismaClient instance with pg adapter
│   └── script.ts                  ← your queries / entry point
│
├── .env                           ← DATABASE_URL + DIRECT_URL (⚠️ never commit!)
├── .gitignore
├── prisma7.config.ts              ← Prisma 7 config file
├── tsconfig.json
└── package.json
```

---

## Troubleshooting

### ❌ `Error: @prisma/client did not initialize yet`
```bash
# Fix: regenerate the client
npx prisma generate
```

---

### ❌ `P1001: Can't reach database server at db.xxx.supabase.co:5432`
**Fix:**
1. Check `DIRECT_URL` in `.env` is correct
2. Make sure your Supabase project is **not paused** (free tier pauses after 1 week of inactivity)
3. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → click your project → it will unpause

---

### ❌ `P1017: Server has closed the connection`
**Fix:** This usually means the connection pooler is not configured correctly.  
Ensure `DATABASE_URL` uses port `6543` and includes `?pgbouncer=true&connection_limit=1`.

---

### ❌ `Environment variable not found: DATABASE_URL`
**Fix:** Make sure `import "dotenv/config"` is the **very first line** of:
- `prisma7.config.ts`
- `src/lib/prisma.ts`

---

### ❌ `Cannot find module '../../generated/prisma/client'`
```bash
# Fix: generate the client
npx prisma generate
```

---

### ❌ `The table 'User' does not exist`
```bash
# Fix: run migrations against the direct connection
npx prisma migrate dev --name init
```

---

### ❌ `Migrations work but runtime queries fail`
**Fix:** Make sure your app (`src/lib/prisma.ts`) uses `DATABASE_URL` (pooled, port 6543),  
and **not** `DIRECT_URL`. Only migrations should use `DIRECT_URL`.

---

### ❌ `TypeError: Cannot use import statement in a module`
**Fix:** Add `"type": "module"` to `package.json`.

---

### ❌ Schema changed but queries are outdated
```bash
# After every schema change, run:
npx prisma migrate dev --name describe_your_change
# This auto-runs prisma generate too
```

---

## Reference Links

| Topic | Official Docs |
|-------|--------------|
| Supabase Official Site | https://supabase.com |
| Supabase Dashboard | https://supabase.com/dashboard |
| Supabase + Prisma Guide | https://supabase.com/docs/guides/database/prisma |
| Supabase Connection Management | https://supabase.com/docs/guides/database/connection-management |
| Supabase Connection Pooling | https://supabase.com/docs/guides/database/connection-management#supavisor |
| Supabase Connection Strings | https://supabase.com/docs/guides/database/connection-management#connection-strings |
| Prisma ORM Getting Started | https://www.prisma.io/docs/getting-started |
| Prisma + Supabase Guide | https://www.prisma.io/docs/orm/overview/databases/supabase |
| Prisma Driver Adapters | https://www.prisma.io/docs/orm/overview/databases/database-drivers |
| Prisma Schema Reference | https://www.prisma.io/docs/orm/reference/prisma-schema-reference |
| Prisma Config Reference | https://www.prisma.io/docs/orm/reference/prisma-config-reference |
| Prisma Client API | https://www.prisma.io/docs/orm/reference/prisma-client-reference |
| Prisma Migrate | https://www.prisma.io/docs/orm/prisma-migrate |
| Prisma Studio | https://www.prisma.io/docs/orm/tools/prisma-studio |
| Environment Variables | https://www.prisma.io/docs/orm/more/development-environment/environment-variables |
| Prisma 7 Upgrade Guide | https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 |
