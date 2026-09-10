# 🐘 How to Set Up Prisma ORM with Prisma Postgres — Step by Step

> **Stack used in this project:**  
> Prisma ORM 7 · Prisma Postgres · TypeScript · Node.js · `tsx` runner · `pg` driver adapter

---

## 📌 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Step 1 — Create a Prisma Postgres Database](#step-1--create-a-prisma-postgres-database)
3. [Step 2 — Initialize the Project](#step-2--initialize-the-project)
4. [Step 3 — Install Dependencies](#step-3--install-dependencies)
5. [Step 4 — Configure TypeScript](#step-4--configure-typescript)
6. [Step 5 — Set Up the `.env` File](#step-5--set-up-the-env-file)
7. [Step 6 — Configure Prisma (`prisma7.config.ts`)](#step-6--configure-prisma-prisma7configts)
8. [Step 7 — Define Your Schema](#step-7--define-your-schema)
9. [Step 8 — Run Migrations](#step-8--run-migrations)
10. [Step 9 — Generate Prisma Client](#step-9--generate-prisma-client)
11. [Step 10 — Create the Prisma Client File](#step-10--create-the-prisma-client-file)
12. [Step 11 — Write Your First Query](#step-11--write-your-first-query)
13. [Step 12 — Run Your Script](#step-12--run-your-script)
14. [Full Project Structure](#full-project-structure)
15. [Troubleshooting](#troubleshooting)
16. [Reference Links](#reference-links)

---

## 1. Prerequisites

Before starting, make sure you have the following installed:

| Tool       | Minimum Version | Check command         |
|------------|-----------------|-----------------------|
| Node.js    | v18+            | `node --version`      |
| npm        | v9+             | `npm --version`       |
| TypeScript | v5+             | `npx tsc --version`   |

You also need a **Prisma account** to create a Prisma Postgres database.  
→ Sign up free at [console.prisma.io](https://console.prisma.io)

---

## Step 1 — Create a Prisma Postgres Database

Prisma Postgres is a managed PostgreSQL database hosted by Prisma.

### Option A: Using the Prisma Console (Recommended for beginners)

1. Go to [console.prisma.io](https://console.prisma.io)
2. Click **"New Project"**
3. Give your project a name
4. Click **"Create Database"**
5. Copy the **connection string** — it looks like:

```
postgres://<token>:<api-key>@db.prisma.io:5432/postgres?sslmode=require
```

### Option B: Using the CLI

```bash
npx create-db
```

This command scaffolds a new Prisma Postgres database and prints the connection string.

> 📚 **Docs:** [Prisma Postgres Setup](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-prisma-postgres)

---

## Step 2 — Initialize the Project

```bash
# Create a new folder and navigate into it
mkdir my-prisma-app
cd my-prisma-app

# Initialize npm
npm init -y
```

---

## Step 3 — Install Dependencies

```bash
# ── Runtime dependencies ─────────────────────────────────────────
npm install @prisma/client @prisma/adapter-pg pg dotenv

# ── Dev dependencies ─────────────────────────────────────────────
npm install -D prisma typescript tsx @types/node @types/pg
```

### What each package does

| Package               | Type    | Purpose                                                      |
|-----------------------|---------|--------------------------------------------------------------|
| `@prisma/client`      | Runtime | The auto-generated Prisma Client for database queries        |
| `@prisma/adapter-pg`  | Runtime | Driver adapter that connects Prisma to `pg` (PostgreSQL)     |
| `pg`                  | Runtime | PostgreSQL client for Node.js                                |
| `dotenv`              | Runtime | Loads `.env` environment variables                           |
| `prisma`              | Dev     | Prisma CLI — for migrations, schema, generate                |
| `typescript`          | Dev     | TypeScript compiler                                          |
| `tsx`                 | Dev     | Runs TypeScript files directly (no compile step needed)      |
| `@types/node`         | Dev     | TypeScript types for Node.js                                 |
| `@types/pg`           | Dev     | TypeScript types for `pg`                                    |

---

## Step 4 — Configure TypeScript

Create a `tsconfig.json` file in the project root:

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

Also update `package.json` to use ES Modules:

```json
{
  "name": "my-prisma-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/script.ts"
  },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

> 💡 `"type": "module"` enables ES module syntax (`import`/`export`) in Node.js.

---

## Step 5 — Set Up the `.env` File

Create a `.env` file in the **project root**:

```env
# .env
# Paste the connection string you copied from Prisma Console
DATABASE_URL="postgres://<token>:<api-key>@db.prisma.io:5432/postgres?sslmode=require"
```

> ⚠️ **IMPORTANT:** Add `.env` to your `.gitignore` — never commit your database credentials!

```bash
# .gitignore
.env
node_modules/
dist/
generated/
```

> 📚 **Docs:** [Environment Variables in Prisma](https://www.prisma.io/docs/orm/more/development-environment/environment-variables)

---

## Step 6 — Configure Prisma (`prisma7.config.ts`)

Prisma 7 uses a **`prisma7.config.ts`** file instead of the old inline `env()` call in `schema.prisma`.

Create `prisma7.config.ts` in the project root:

```typescript
// prisma7.config.ts
import "dotenv/config";               // ← loads DATABASE_URL from .env
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",     // ← path to your schema file
  migrations: {
    path: "prisma/migrations",        // ← where migration files are stored
  },
  datasource: {
    url: process.env["DATABASE_URL"], // ← reads from .env
  },
});
```

> ⚠️ In **Prisma 7**, the `url` is no longer set inside `schema.prisma`.  
> It is read from `prisma7.config.ts` → `datasource.url`.

> 📚 **Docs:** [Prisma Configuration File](https://www.prisma.io/docs/orm/reference/prisma-config-reference)

---

## Step 7 — Define Your Schema

Initialize Prisma to create the `prisma/` folder:

```bash
npx prisma init
```

Then open `prisma/schema.prisma` and define your models:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"          // ← Prisma 7 generator name
  output   = "../generated/prisma"    // ← where the Client is generated
}

datasource db {
  provider = "postgresql"
  // ✅ No url here in Prisma 7 — it's in prisma7.config.ts
}

// ── Your Models ──────────────────────────────────────────────────

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

### Key Differences in Prisma 7

| Feature              | Prisma 6 (old)          | Prisma 7 (new)                      |
|----------------------|-------------------------|--------------------------------------|
| Generator provider   | `prisma-client-js`      | `prisma-client`                      |
| DB URL               | `url = env("DATABASE_URL")` in schema | `datasource.url` in `prisma7.config.ts` |
| Driver               | Built-in                | Driver adapter required (`@prisma/adapter-pg`) |

> 📚 **Docs:** [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)

---

## Step 8 — Run Migrations

Migrations create (or update) the actual tables in your Prisma Postgres database.

```bash
# Create and apply the first migration
npx prisma migrate dev --name init
```

This command:
1. Reads your `prisma7.config.ts` to get the database URL
2. Compares your schema to the current database state
3. Generates a SQL migration file inside `prisma/migrations/`
4. Applies that migration to the database

```bash
# Output you should see:
# ✔  Generated migration 20240901_init
# ✔  Applied migration 20240901_init
```

### Other Useful Migration Commands

```bash
# Apply existing migrations (no new changes)
npx prisma migrate deploy

# Reset the database (drops + re-creates all tables)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# View your database in a browser GUI
npx prisma studio
```

> 📚 **Docs:** [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)

---

## Step 9 — Generate Prisma Client

After every schema change, regenerate the Prisma Client:

```bash
npx prisma generate
```

This reads `prisma/schema.prisma` and generates a fully-typed Client into `generated/prisma/`.

```bash
# Output you should see:
# ✔  Generated Prisma Client to ./generated/prisma
```

> 💡 `prisma migrate dev` automatically runs `prisma generate` after applying a migration.  
> You only need to run it manually if you change the schema **without** migrating.

---

## Step 10 — Create the Prisma Client File

Create the shared Prisma Client instance at `src/lib/prisma.ts`:

```typescript
// src/lib/prisma.ts
import "dotenv/config";                           // loads .env
import { PrismaPg } from "@prisma/adapter-pg";    // PostgreSQL driver adapter
import { PrismaClient } from "../../generated/prisma/client"; // generated client

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });  // create the pg adapter
const prisma  = new PrismaClient({ adapter });       // pass adapter to PrismaClient

export { prisma };
```

### Why the Driver Adapter?

In **Prisma 7**, you must use a **driver adapter** to connect Prisma to your database.  
The `PrismaPg` adapter wraps the `pg` library and passes it into `PrismaClient`.

```
Your Code → PrismaClient → PrismaPg adapter → pg → PostgreSQL DB
```

> 📚 **Docs:** [Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)

---

## Step 11 — Write Your First Query

Create the main script at `src/script.ts`:

```typescript
// src/script.ts
import { prisma } from "./lib/prisma";

async function main() {
  // ── 1. Create a User with a Post ────────────────────────────────
  const user = await prisma.user.create({
    data: {
      name:  "Alice",
      email: "alice@prisma.io",
      posts: {
        create: {
          title:     "Hello World",
          content:   "My first post with Prisma!",
          published: true,
        },
      },
    },
    include: {
      posts: true,   // ← include posts in the response
    },
  });
  console.log("✅ Created user:", user);

  // ── 2. Create a standalone Post ──────────────────────────────────
  const post = await prisma.post.create({
    data: {
      authorId:  1,
      title:     "Second Post",
      content:   "Another post!",
      published: true,
    },
  });
  console.log("✅ Created post:", post);

  // ── 3. Fetch all users with their posts ──────────────────────────
  const allUsers = await prisma.user.findMany({
    include: { posts: true },
  });
  console.log("✅ All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
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
  id: 1,
  name: 'Alice',
  email: 'alice@prisma.io',
  posts: [ { id: 1, title: 'Hello World', ... } ]
}
✅ Created post: { id: 2, title: 'Second Post', ... }
✅ All users: [
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@prisma.io",
    "posts": [ ... ]
  }
]
```

---

## Full Project Structure

```
my-prisma-app/
│
├── prisma/
│   ├── schema.prisma          ← your models
│   └── migrations/            ← auto-generated SQL migration files
│       └── 20240901_init/
│           └── migration.sql
│
├── generated/
│   └── prisma/                ← auto-generated Prisma Client (don't edit!)
│       └── client/
│
├── src/
│   ├── lib/
│   │   └── prisma.ts          ← shared PrismaClient instance
│   └── script.ts              ← your queries / entry point
│
├── .env                       ← DATABASE_URL (never commit this!)
├── .gitignore
├── prisma7.config.ts          ← Prisma 7 configuration
├── tsconfig.json
└── package.json
```

---

## Troubleshooting

### ❌ `Error: @prisma/client did not initialize yet`
**Fix:** Run `npx prisma generate` to regenerate the client.

---

### ❌ `Can't reach database server`
**Fix:** Check your `DATABASE_URL` in `.env`. Make sure it's the correct Prisma Postgres connection string.

---

### ❌ `Environment variable not found: DATABASE_URL`
**Fix:** Make sure `import "dotenv/config"` is at the **top** of `prisma7.config.ts` and `src/lib/prisma.ts`.

---

### ❌ `TypeError: Cannot use import statement in a module`
**Fix:** Make sure `"type": "module"` is in `package.json`.

---

### ❌ `The table 'User' does not exist`
**Fix:** Run migrations first — `npx prisma migrate dev --name init`.

---

### ❌ Schema changed but queries are outdated
**Fix:** After every schema change, run:
```bash
npx prisma migrate dev --name your_change_name
# (this auto-runs prisma generate too)
```

---

## Reference Links

| Topic | Official Docs |
|-------|--------------|
| Prisma ORM Getting Started | https://www.prisma.io/docs/getting-started |
| Prisma Postgres | https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-prisma-postgres |
| Prisma Schema Reference | https://www.prisma.io/docs/orm/reference/prisma-schema-reference |
| Prisma Config Reference | https://www.prisma.io/docs/orm/reference/prisma-config-reference |
| Prisma Client API | https://www.prisma.io/docs/orm/reference/prisma-client-reference |
| Prisma Migrate | https://www.prisma.io/docs/orm/prisma-migrate |
| Driver Adapters | https://www.prisma.io/docs/orm/overview/databases/database-drivers |
| Environment Variables | https://www.prisma.io/docs/orm/more/development-environment/environment-variables |
| Prisma Studio | https://www.prisma.io/docs/orm/tools/prisma-studio |
| Prisma Console | https://console.prisma.io |
| Connection Strings | https://www.prisma.io/docs/orm/reference/connection-urls |
| Prisma 7 Migration Guide | https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 |
