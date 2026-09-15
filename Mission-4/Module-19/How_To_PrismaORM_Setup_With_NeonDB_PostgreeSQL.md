# ⚡ How to Set Up Prisma ORM with NeonDB PostgreSQL — Step by Step

> **Stack:** Prisma ORM 7 · NeonDB Serverless PostgreSQL · TypeScript · Node.js · `tsx` · `@neondatabase/serverless` driver adapter

---

## 📌 Table of Contents

1.  [What is NeonDB?](#1-what-is-neondb)
2.  [Prerequisites](#2-prerequisites)
3.  [Step 1 — Create a NeonDB Database](#step-1--create-a-neondb-database)
4.  [Step 2 — Initialize the Project](#step-2--initialize-the-project)
5.  [Step 3 — Install Dependencies](#step-3--install-dependencies)
6.  [Step 4 — Configure TypeScript & package.json](#step-4--configure-typescript--packagejson)
7.  [Step 5 — Set Up the `.env` File](#step-5--set-up-the-env-file)
8.  [Step 6 — Configure Prisma (`prisma7.config.ts`)](#step-6--configure-prisma-prisma7configts)
9.  [Step 7 — Define Your Schema](#step-7--define-your-schema)
10. [Step 8 — Run Migrations](#step-8--run-migrations)
11. [Step 9 — Generate Prisma Client](#step-9--generate-prisma-client)
12. [Step 10 — Create the Prisma Client File](#step-10--create-the-prisma-client-file)
13. [Step 11 — Write Your First Query](#step-11--write-your-first-query)
14. [Step 12 — Run Your Script](#step-12--run-your-script)
15. [NeonDB vs Prisma Postgres — Comparison](#neondb-vs-prisma-postgres--comparison)
16. [Full Project Structure](#full-project-structure)
17. [Troubleshooting](#troubleshooting)
18. [Reference Links](#reference-links)

---

## 1. What is NeonDB?

**NeonDB** is a **serverless PostgreSQL** provider — it gives you a fully managed, auto-scaling PostgreSQL database in the cloud with a **generous free tier**.

| Feature            | Detail                                         |
|--------------------|------------------------------------------------|
| Database type      | PostgreSQL (fully compatible)                  |
| Pricing            | Free tier available (0.5 GB storage)           |
| Connection         | Standard PostgreSQL connection string          |
| Serverless         | Yes — scales to zero when idle                 |
| Regions            | AWS us-east-1, eu-central-1, ap-southeast-1, etc. |
| Console            | [console.neon.tech](https://console.neon.tech) |

---

## 2. Prerequisites

| Tool       | Minimum Version | Check command       |
|------------|-----------------|---------------------|
| Node.js    | v18+            | `node --version`    |
| npm        | v9+             | `npm --version`     |
| TypeScript | v5+             | `npx tsc --version` |

Sign up free at [neon.tech](https://neon.tech) — no credit card required.

---

## Step 1 — Create a NeonDB Database

### 1.1 Sign Up & Create a Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **"Sign Up"** (free — use GitHub, Google, or email)
3. Click **"New Project"**
4. Fill in:
   - **Project name:** e.g. `my-prisma-app`
   - **Database name:** e.g. `neondb` (default)
   - **Region:** choose the closest to you
5. Click **"Create Project"**

### 1.2 Copy the Connection String

After creating the project, NeonDB shows you the connection string.  
Click **"Connection Details"** → choose **"Prisma"** from the framework dropdown:

```
postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
```

**Example:**
```
postgresql://alex:AbC12345@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> ⚠️ **Copy this now** — you'll need it for the `.env` file.

> 📚 **Docs:** [NeonDB — Connect from Prisma](https://neon.tech/docs/guides/prisma)

---

## Step 2 — Initialize the Project

```bash
# Create a new project folder
mkdir my-neon-prisma-app
cd my-neon-prisma-app

# Initialize npm
npm init -y
```

---

## Step 3 — Install Dependencies

NeonDB uses the `@neondatabase/serverless` driver for optimal serverless performance,  
combined with `@prisma/adapter-neon` to plug into Prisma 7.

```bash
# ── Runtime dependencies ─────────────────────────────────────────
npm install @prisma/client @prisma/adapter-neon @neondatabase/serverless dotenv ws

# ── Dev dependencies ─────────────────────────────────────────────
npm install -D prisma typescript tsx @types/node @types/ws
```

### What Each Package Does

| Package                     | Type    | Purpose                                                        |
|-----------------------------|---------|----------------------------------------------------------------|
| `@prisma/client`            | Runtime | Auto-generated Prisma Client for database queries              |
| `@prisma/adapter-neon`      | Runtime | Prisma driver adapter for NeonDB serverless                    |
| `@neondatabase/serverless`  | Runtime | NeonDB's serverless PostgreSQL driver (HTTP + WebSocket)       |
| `dotenv`                    | Runtime | Loads `.env` environment variables                             |
| `ws`                        | Runtime | WebSocket support required by `@neondatabase/serverless`       |
| `prisma`                    | Dev     | Prisma CLI — migrations, schema, generate                      |
| `typescript`                | Dev     | TypeScript compiler                                            |
| `tsx`                       | Dev     | Run TypeScript files directly (no compile step)                |
| `@types/node`               | Dev     | TypeScript types for Node.js built-ins                         |
| `@types/ws`                 | Dev     | TypeScript types for the `ws` package                          |

> 💡 **Why `@neondatabase/serverless` instead of `pg`?**  
> NeonDB's serverless driver supports **HTTP mode** (one query per HTTP request) and  
> **WebSocket mode** (persistent connection for multiple queries). It's optimized for  
> serverless environments (Vercel, AWS Lambda, Cloudflare Workers) and edge runtimes.

---

## Step 4 — Configure TypeScript & package.json

### `tsconfig.json`

Create `tsconfig.json` in the project root:

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

Update `package.json` to add `"type": "module"` and a dev script:

```json
{
  "name": "my-neon-prisma-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":      "tsx src/script.ts",
    "generate": "prisma generate",
    "migrate":  "prisma migrate dev",
    "studio":   "prisma studio"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "@prisma/adapter-neon":    "^7.0.0",
    "@prisma/client":          "^7.0.0",
    "dotenv":                  "^16.0.0",
    "ws":                      "^8.18.0"
  },
  "devDependencies": {
    "@types/node":  "^20.0.0",
    "@types/ws":    "^8.5.10",
    "prisma":       "^7.0.0",
    "tsx":          "^4.0.0",
    "typescript":   "^5.0.0"
  }
}
```

---

## Step 5 — Set Up the `.env` File

Create `.env` in the **project root**:

```env
# .env
# Paste your NeonDB connection string here
DATABASE_URL="postgresql://alex:AbC12345@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

> ⚠️ **NEVER commit `.env` to Git!** Add it to `.gitignore`:

```bash
# .gitignore
.env
node_modules/
dist/
generated/
```

### Connection String Format (NeonDB)

```
postgresql://<user>:<password>@<host>.neon.tech/<database>?sslmode=require
│             │       │         │                │
│             │       │         │                └─ database name (default: neondb)
│             │       │         └─ your neon host (e.g. ep-cool-darkness-123456.us-east-2.aws.neon.tech)
│             │       └─ your password (auto-generated by Neon)
│             └─ your username (e.g. alex)
└─ protocol (postgresql or postgres — both work)
```

> ⚠️ `sslmode=require` is **mandatory** for NeonDB — always include it.

> 📚 **Docs:** [NeonDB Connection String](https://neon.tech/docs/connect/connect-from-any-app)

---

## Step 6 — Configure Prisma (`prisma7.config.ts`)

Create `prisma7.config.ts` in the project root:

```typescript
// prisma7.config.ts
import "dotenv/config";               // ← must be first — loads .env
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",     // ← path to your schema file
  migrations: {
    path: "prisma/migrations",        // ← where migration SQL files are saved
  },
  datasource: {
    url: process.env["DATABASE_URL"], // ← reads from .env
  },
});
```

> 📚 **Docs:** [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)

---

## Step 7 — Define Your Schema

Initialize Prisma to create the `prisma/` folder:

```bash
npx prisma init
```

Open `prisma/schema.prisma` and define your models:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"         // ← Prisma 7 generator name
  output   = "../generated/prisma"   // ← generated Client output folder
}

datasource db {
  provider = "postgresql"            // ← NeonDB is PostgreSQL
  // ✅ No url here in Prisma 7 — url lives in prisma7.config.ts
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

### Prisma 6 vs Prisma 7 — Key Changes

| Feature            | Prisma 6 (old)                         | Prisma 7 (new)                          |
|--------------------|----------------------------------------|-----------------------------------------|
| Generator provider | `"prisma-client-js"`                   | `"prisma-client"`                       |
| DB URL location    | `url = env("DATABASE_URL")` in schema  | `datasource.url` in `prisma7.config.ts` |
| Driver             | Built-in (no adapter needed)           | Driver adapter required                 |
| Neon adapter       | `@prisma/adapter-neon` (optional)      | `@prisma/adapter-neon` (required)       |

> 📚 **Docs:** [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)

---

## Step 8 — Run Migrations

Create and apply your first migration to NeonDB:

```bash
npx prisma migrate dev --name init
```

This command:
1. Reads `prisma7.config.ts` → gets `DATABASE_URL`
2. Connects to your NeonDB database
3. Generates a `.sql` migration file in `prisma/migrations/`
4. Runs the SQL against your NeonDB instance
5. Auto-runs `prisma generate` to update the Client

```bash
# ✅ Expected output:
# Environment variables loaded from .env
# Prisma schema loaded from prisma/schema.prisma
# Datasource "db": PostgreSQL database "neondb", schema "public"
# ✔  Generated migration 20240901000000_init
# ✔  The migration was applied successfully
```

### All Migration Commands

```bash
# Create + apply a new migration
npx prisma migrate dev --name <migration_name>

# Apply existing migrations (for production / CI)
npx prisma migrate deploy

# Reset the DB — drops & re-creates all tables ⚠️
npx prisma migrate reset

# Check pending migrations
npx prisma migrate status

# Open Prisma Studio (browser DB GUI)
npx prisma studio
```

> 📚 **Docs:** [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)

---

## Step 9 — Generate Prisma Client

After every schema change, run:

```bash
npx prisma generate
```

This reads `prisma/schema.prisma` and generates a fully-typed Prisma Client into `generated/prisma/`.

> 💡 `prisma migrate dev` runs `prisma generate` automatically.  
> Only run `prisma generate` manually when you change the schema **without** running a migration.

---

## Step 10 — Create the Prisma Client File

Create `src/lib/prisma.ts` — the shared Prisma Client instance for your whole app:

```typescript
// src/lib/prisma.ts
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma/client";

// Create the Neon SQL connection
const sql = neon(process.env.DATABASE_URL!);

// Wrap it in the Prisma adapter
const adapter = new PrismaNeon(sql);

// Create the Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

export { prisma };
```

### How the Connection Works

```
Your Code
   ↓
PrismaClient (with adapter)
   ↓
PrismaNeon adapter  (@prisma/adapter-neon)
   ↓
neon() driver       (@neondatabase/serverless)
   ↓
NeonDB PostgreSQL   (over HTTPS or WebSocket)
```

> 📚 **Docs:** [Prisma + Neon Integration](https://neon.tech/docs/guides/prisma)  
> 📚 **Docs:** [Prisma Adapter for Neon](https://www.prisma.io/docs/orm/overview/databases/neon)

---

## Step 11 — Write Your First Query

Create `src/script.ts`:

```typescript
// src/script.ts
import { prisma } from "./lib/prisma";

async function main() {
  // ── 1. Create a User with a Post ─────────────────────────────────
  const user = await prisma.user.create({
    data: {
      name:  "Alice",
      email: "alice@neon.io",
      posts: {
        create: {
          title:     "Hello NeonDB!",
          content:   "My first post with Prisma + NeonDB!",
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
      content:   "Another post via Prisma + NeonDB!",
      published: false,
    },
  });
  console.log("✅ Created post:", post);

  // ── 3. Fetch all users with their posts ───────────────────────────
  const allUsers = await prisma.user.findMany({
    include: { posts: true },
  });
  console.log("✅ All users:", JSON.stringify(allUsers, null, 2));

  // ── 4. Update a post ──────────────────────────────────────────────
  const updated = await prisma.post.update({
    where: { id: post.id },
    data:  { published: true },
  });
  console.log("✅ Updated post:", updated);

  // ── 5. Count total posts ──────────────────────────────────────────
  const count = await prisma.post.count();
  console.log("✅ Total posts:", count);
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

## Step 12 — Run Your Script

```bash
npx tsx src/script.ts
```

Expected output:

```
✅ Created user: {
  "id": 1,
  "name": "Alice",
  "email": "alice@neon.io",
  "posts": [
    {
      "id": 1,
      "title": "Hello NeonDB!",
      "content": "My first post with Prisma + NeonDB!",
      "published": true,
      "authorId": 1
    }
  ]
}
✅ Created post: { id: 2, title: 'Second Post', published: false, authorId: 1 }
✅ All users: [ ... ]
✅ Updated post: { id: 2, title: 'Second Post', published: true, authorId: 1 }
✅ Total posts: 2
```

---

## NeonDB vs Prisma Postgres — Comparison

| Feature               | NeonDB                             | Prisma Postgres                     |
|-----------------------|-------------------------------------|--------------------------------------|
| Provider              | Neon (neon.tech)                   | Prisma (prisma.io)                   |
| Free tier             | ✅ 0.5 GB, 1 project               | ✅ Limited free tier                 |
| Connection string     | `postgresql://...@neon.tech/...`   | `postgres://...@db.prisma.io/...`   |
| Driver package        | `@neondatabase/serverless`         | `pg`                                 |
| Prisma adapter        | `@prisma/adapter-neon`             | `@prisma/adapter-pg`                 |
| Edge/Serverless ready | ✅ Yes (HTTP mode)                  | ✅ Yes                               |
| Branching             | ✅ Git-like DB branching            | ❌ Not available                     |
| Regions               | AWS multi-region                   | Prisma-managed                       |
| Best for              | Serverless, Vercel, Cloudflare     | Prisma ecosystem projects            |

---

## Full Project Structure

```
my-neon-prisma-app/
│
├── prisma/
│   ├── schema.prisma              ← data models
│   └── migrations/                ← auto-generated SQL files
│       └── 20240901000000_init/
│           └── migration.sql
│
├── generated/
│   └── prisma/                    ← generated Prisma Client (do not edit)
│       └── client/
│
├── src/
│   ├── lib/
│   │   └── prisma.ts              ← PrismaClient instance with Neon adapter
│   └── script.ts                  ← your queries / entry point
│
├── .env                           ← DATABASE_URL (⚠️ never commit!)
├── .gitignore
├── prisma7.config.ts              ← Prisma 7 config (reads from .env)
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

### ❌ `SSL connection error` or `SSL SYSCALL error`
**Fix:** Make sure your connection string includes `?sslmode=require`:
```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

---

### ❌ `Environment variable not found: DATABASE_URL`
**Fix:** Make sure `import "dotenv/config"` is the **very first line** of:
- `prisma7.config.ts`
- `src/lib/prisma.ts`

---

### ❌ `Cannot find module '../../generated/prisma/client'`
**Fix:** Run `npx prisma generate` to create the generated client files.

---

### ❌ `The table 'User' does not exist`
**Fix:** Run migrations first:
```bash
npx prisma migrate dev --name init
```

---

### ❌ `TypeError: Cannot use import statement`
**Fix:** Add `"type": "module"` to your `package.json`.

---

### ❌ `Connection timeout` or `ECONNREFUSED`
**Fix:**  
1. Check your NeonDB project is not suspended (free tier suspends after inactivity).
2. Go to [console.neon.tech](https://console.neon.tech) → click your project → it will wake up.
3. Try again after a few seconds.

---

### ❌ Schema changed but `prisma generate` not reflecting it
**Fix:** Always run migrations after schema changes:
```bash
npx prisma migrate dev --name describe_your_change
# This also auto-runs prisma generate
```

---

## Reference Links

| Topic | Official Docs |
|-------|--------------|
| NeonDB Official Site | https://neon.tech |
| NeonDB Console | https://console.neon.tech |
| NeonDB + Prisma Guide | https://neon.tech/docs/guides/prisma |
| NeonDB Connection Strings | https://neon.tech/docs/connect/connect-from-any-app |
| NeonDB Serverless Driver | https://neon.tech/docs/serverless/serverless-driver |
| Prisma ORM Getting Started | https://www.prisma.io/docs/getting-started |
| Prisma + Neon Docs | https://www.prisma.io/docs/orm/overview/databases/neon |
| Prisma Driver Adapters | https://www.prisma.io/docs/orm/overview/databases/database-drivers |
| Prisma Schema Reference | https://www.prisma.io/docs/orm/reference/prisma-schema-reference |
| Prisma Config Reference | https://www.prisma.io/docs/orm/reference/prisma-config-reference |
| Prisma Client API | https://www.prisma.io/docs/orm/reference/prisma-client-reference |
| Prisma Migrate | https://www.prisma.io/docs/orm/prisma-migrate |
| Prisma Studio | https://www.prisma.io/docs/orm/tools/prisma-studio |
| Environment Variables | https://www.prisma.io/docs/orm/more/development-environment/environment-variables |
| Prisma 7 Upgrade Guide | https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 |
