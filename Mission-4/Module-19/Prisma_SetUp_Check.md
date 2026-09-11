# 🔷 Prisma Setup Check Commands

> A complete reference guide to verify, validate, and manage your Prisma ORM setup.

---

## 📌 Table of Contents
1. [Check Prisma Version](#1-check-prisma-version)
2. [Validate Schema](#2-validate-schema)
3. [Format Schema](#3-format-schema)
4. [Check DB Connection & Push Schema](#4-check-db-connection--push-schema)
5. [Generate Prisma Client](#5-generate-prisma-client)
6. [Open Prisma Studio](#6-open-prisma-studio)
7. [Run Migrations](#7-run-migrations)
8. [Seed the Database](#8-seed-the-database)
9. [Inspect Database](#9-inspect-database)
10. [Reset Database](#10-reset-database)
11. [Quick Full Check](#-quick-full-check-run-in-order)

---

## 1. Check Prisma Version
```bash
npx prisma --version
```
> Displays the installed version of Prisma CLI and Prisma Client.

---

## 2. Validate Schema
```bash
npx prisma validate
```
> Checks your `schema.prisma` for syntax errors without making any changes.

---

## 3. Format Schema
```bash
npx prisma format
```
> Auto-formats and validates your `schema.prisma` file (like Prettier for Prisma).

---

## 4. Check DB Connection & Push Schema
```bash
npx prisma db push
```
> Tests database connection and syncs your schema directly to the DB.
> ⚠️ No migration files are created — best for prototyping.

---

## 5. Generate Prisma Client
```bash
npx prisma generate
```
> Generates the Prisma Client based on your current `schema.prisma`.
> Must re-run after every schema change.

---

## 6. Open Prisma Studio (Visual DB Browser)
```bash
npx prisma studio
```
> Opens a visual browser at `http://localhost:5555` to explore and edit your database.

---

## 7. Run Migrations
```bash
# Create and apply a new migration
npx prisma migrate dev --name init

# Apply existing migrations (production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```
> Tracks schema changes with versioned SQL migration files.

---

## 8. Seed the Database
```bash
npx prisma db seed
```
> Runs your seed script defined in `package.json` under `prisma.seed`.
> Example `package.json` config:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

---

## 9. Inspect Database (Pull Schema from DB)
```bash
npx prisma db pull
```
> Introspects your existing database and updates `schema.prisma` to match it.
> Useful when connecting Prisma to an existing database.

---

## 10. Reset Database
```bash
npx prisma migrate reset
```
> ⚠️ WARNING: Drops all data, re-applies migrations, and re-seeds the database.
> Use only in development!

---

## ✅ Quick Full Check (Run in order)

```bash
npx prisma validate       # 1. Validate schema syntax
npx prisma format         # 2. Format schema file
npx prisma generate       # 3. Generate Prisma Client
npx prisma db push        # 4. Test DB connection & sync schema
npx prisma migrate status # 5. Check migration status
npx prisma studio         # 6. Browse your DB visually
```

---

## 📁 Project Root Path

Run all commands from your project root:

```
i:\Programming_Hero(Level-2)\Mission-4\Module-19
```

---

## 🗂️ Key Files Reference

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Main schema file (models, datasource, generator) |
| `prisma/migrations/` | Auto-generated SQL migration history |
| `prisma/seed.ts` | Database seeding script |
| `.env` | Database connection URL (`DATABASE_URL`) |
| `node_modules/.prisma/client` | Generated Prisma Client output |

---

## 🔗 Useful Links

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
