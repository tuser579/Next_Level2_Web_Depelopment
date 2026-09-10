# 📘 Prisma Schema Language (PSL) — Complete Cheat Sheet

> **Goal:** Understand every part of a `.prisma` file so you can write, read, and debug schemas confidently.  
> All content follows the **official Prisma documentation**.

---

## 📌 Table of Contents

1.  [Schema Structure](#1-schema-structure)
2.  [Naming Rules & Conventions](#2-naming-rules--conventions)
3.  [Data Types (Scalar Types)](#3-data-types-scalar-types)
4.  [Native Database Types (`@db`)](#4-native-database-types-db)
5.  [Field Type Modifiers](#5-field-type-modifiers)
6.  [Field Attributes (`@`)](#6-field-attributes-)
7.  [Model Attributes (`@@`)](#7-model-attributes-)
8.  [Relations](#8-relations)
9.  [Enums](#9-enums)
10. [Views](#10-views)
11. [Multi-Schema Support](#11-multi-schema-support)
12. [Generator Options](#12-generator-options)
13. [Real-World Example](#13-real-world-example)
14. [Quick Reference Card](#14-quick-reference-card)
15. [Official Reference Links](#15-official-reference-links)

---

## 1. Schema Structure

Every `.prisma` file is made up of **core blocks**:

```prisma
// 1️⃣  generator — tells Prisma WHAT to generate & WHERE to output it
generator client {
  provider = "prisma-client"          // Prisma 7 generator
  output   = "../generated/prisma"    // output path
}

// 2️⃣  datasource — tells Prisma WHICH database to connect to
datasource db {
  provider = "postgresql"   // "mysql" | "sqlite" | "sqlserver" | "mongodb" | "cockroachdb"
  // url is set in prisma7.config.ts in Prisma 7
}

// 3️⃣  model — maps to a TABLE (relational) or COLLECTION (MongoDB)
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}

// 4️⃣  enum — a fixed set of allowed string values
enum Role {
  USER
  ADMIN
}

// 5️⃣  view — maps to a DB VIEW (read-only)
view UserSummary {
  id    Int    @unique
  email String
}
```

| Block        | Purpose                                          | Required?        |
|-------------|--------------------------------------------------|------------------|
| `generator`  | What Prisma generates (Client, etc.)             | ✅ Yes            |
| `datasource` | Database connection details                      | ✅ Yes            |
| `model`      | Represents a table / collection                  | ✅ At least one   |
| `enum`       | A fixed set of allowed string values             | Optional          |
| `view`       | Maps to a database view (read-only)              | Optional          |
| `type`       | Composite/embedded type (MongoDB only)           | Optional          |

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/overview

---

## 2. Naming Rules & Conventions

### Core Conventions

| Entity             | Convention             | Example                           | Rules                                    |
|--------------------|------------------------|-----------------------------------|------------------------------------------|
| **Model**          | `PascalCase`, Singular | `User`, `Post`, `ProductCategory` | Must start with a letter. No spaces.     |
| **Enum**           | `PascalCase`, Singular | `Role`, `Status`                  | Same rules as Model                      |
| **Enum value**     | `UPPER_SNAKE_CASE`     | `SUPER_ADMIN`, `IN_PROGRESS`      | All uppercase by convention              |
| **Field**          | `camelCase`            | `email`, `createdAt`, `authorId`  | Must start with a letter                 |
| **Relation field** | `camelCase`            | `posts`, `profile`                | Prisma-level only — no DB column         |

### DB Mapping — `@map` & `@@map`

Use when your **Prisma name** must differ from the **database name** (e.g. legacy tables).

```prisma
model User {
  id    Int    @id
  email String @map("user_email")   // Prisma: "email"  →  DB column: "user_email"

  @@map("users")                    // Prisma: "User"   →  DB table: "users"
}

enum Role {
  ADMIN @map("administrator")       // TS enum: ADMIN   →  DB value: "administrator"

  @@map("role_enum")                // DB enum type name: "role_enum"
}
```

| Directive | Target            | Maps                  |
|-----------|-------------------|-----------------------|
| `@map`    | Field / Enum value| Field/value → DB name |
| `@@map`   | Model / Enum type | Model/Enum → DB name  |

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/models#mapping-model-names-to-tables-or-collections

---

## 3. Data Types (Scalar Types)

These map directly to **database columns**.

| Prisma Type   | Description                    | TypeScript Type   | Notes                                         |
|---------------|--------------------------------|-------------------|-----------------------------------------------|
| `String`      | Variable-length text           | `string`          | Maps to `TEXT`, `VARCHAR`, etc.               |
| `Boolean`     | True / False                   | `boolean`         |                                               |
| `Int`         | 32-bit signed integer          | `number`          |                                               |
| `BigInt`      | 64-bit signed integer          | `bigint`          | Use `BigInt()` literal in JS                  |
| `Float`       | 64-bit floating-point          | `number`          | ⚠️ Not safe for money                         |
| `Decimal`     | Arbitrary precision decimal    | `Decimal`         | ✅ Safe for money. Relational DBs only.        |
| `DateTime`    | Date and time                  | `Date`            | Always stored as UTC                          |
| `Json`        | Raw JSON data                  | `JsonValue`       | Limited indexing. Not in SQLite.              |
| `Bytes`       | Binary data / blob             | `Buffer`          |                                               |
| `Enum`        | User-defined set of values     | Generated Enum    | Defined with `enum` block                     |
| `Unsupported` | Raw native DB type             | `unknown`         | For DB types Prisma doesn't model yet         |

```prisma
model AllTypes {
  id        Int      @id @default(autoincrement())
  text      String
  flag      Boolean  @default(false)
  count     Int      @default(0)
  bigNum    BigInt
  price     Decimal  @db.Decimal(10, 2)  // ← 10 digits total, 2 after decimal
  score     Float
  createdAt DateTime @default(now())
  data      Json?
  blob      Bytes?
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-field-scalar-types

---

## 4. Native Database Types (`@db`)

Use `@db.TypeName` to specify the **exact native database column type**.  
This overrides Prisma's default type mapping.

### PostgreSQL Native Types

```prisma
model PgExample {
  id        Int      @id
  // Strings
  name      String   @db.VarChar(255)     // VARCHAR(255)
  bio       String   @db.Text             // TEXT (unlimited)
  code      String   @db.Char(10)         // CHAR(10) fixed-length
  // Numbers
  price     Decimal  @db.Decimal(10, 2)   // DECIMAL(10,2)
  rating    Float    @db.Real             // REAL (32-bit)
  bigNum    BigInt   @db.BigInt           // BIGINT
  smallNum  Int      @db.SmallInt         // SMALLINT
  // Date/Time
  createdAt DateTime @db.Timestamptz(3)   // TIMESTAMPTZ with precision    // 2026-09-03 00:25:00 +06:00
  dateOnly  DateTime @db.Date             // DATE only                     // 2026-09-03
  timeOnly  DateTime @db.Time(3)          // TIME only                     // 18:27:55.678
  // Other
  ipAddr    String   @db.Inet             // INET (IP address)
  uid       String   @db.Uuid             // UUID
  data      Json     @db.JsonB            // JSONB (binary JSON, indexable)
  blob      Bytes    @db.ByteA            // BYTEA
}
```

### MySQL Native Types

```prisma
model MysqlExample {
  id      Int    @id
  name    String @db.VarChar(100)
  bio     String @db.LongText
  age     Int    @db.TinyInt             // TINYINT
  price   Decimal @db.Decimal(8, 2)
  uid     String  @db.Char(36)           // UUID stored as CHAR(36)
  created DateTime @db.DateTime(0)
}
```

### SQLite Native Types

```prisma
model SqliteExample {
  id    Int    @id
  name  String // SQLite is loosely typed — @db not commonly needed
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-field-scalar-types  
> 📚 **PostgreSQL types:** https://www.prisma.io/docs/orm/overview/databases/postgresql  
> 📚 **MySQL types:** https://www.prisma.io/docs/orm/overview/databases/mysql

---

## 5. Field Type Modifiers

Modifiers change **how a type behaves** — required, optional, or a list.

| Modifier | Syntax          | Description                     | SQL equivalent |
|----------|-----------------|---------------------------------|----------------|
| (none)   | `name String`   | **Required** — cannot be null   | `NOT NULL`     |
| `?`      | `bio String?`   | **Optional** — can be null      | `NULL`         |
| `[]`     | `tags String[]` | **List / Array**                | varies by DB   |

```prisma
model Example {
  id       Int      @id
  required String               // ← NOT NULL — must always have a value
  optional String?              // ← NULL     — can be omitted/null
  list     String[]             // ← Array    — multiple values
                                //   ❌ not supported in SQLite for scalar types
}
```

> ⚠️ **SQLite:** Scalar lists (`String[]`) are **not supported**. Use a related model instead.  
> ⚠️ **MongoDB:** Both `?` and `[]` are fully supported.

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/models#type-modifiers

---

## 6. Field Attributes (`@`)

Field attributes modify a **single field**. They are prefixed with a single `@`.

### 6.1 All Field Attributes

| Attribute       | Example                              | Description                                                          |
|-----------------|--------------------------------------|----------------------------------------------------------------------|
| `@id`           | `id Int @id`                         | **Primary key**. One per model. Use `@@id` for composite PKs.        |
| `@unique`       | `email String @unique`               | Enforces a **unique constraint** on this single column               |
| `@default()`    | `active Boolean @default(true)`      | **Default value** when no value is provided on create                |
| `@updatedAt`    | `updatedAt DateTime @updatedAt`      | **Auto-sets** to current timestamp on every `update` operation       |
| `@relation()`   | `author User @relation(...)`         | Defines a **relation** to another model                              |
| `@map()`        | `email String @map("user_email")`    | Maps to a different **column name** in the DB                        |
| `@ignore`       | `legacy String @ignore`              | **Excludes** this field from Prisma Client (still exists in DB)      |
| `@db.xxx`       | `code String @db.VarChar(10)`        | Sets the **exact native DB column type**                             |

---

### 6.2 `@default()` — All Functions

| Function              | Result type  | Example                                         | Description                              | Support           |
|-----------------------|--------------|-------------------------------------------------|------------------------------------------|-------------------|
| `autoincrement()`     | `Int`        | `Int @default(autoincrement())`                 | Increments: 1, 2, 3, ...                 | Relational DBs    |
| `sequence()`          | `Int/BigInt` | `Int @default(sequence())`                      | CockroachDB-style sequence               | CockroachDB only  |
| `cuid()`              | `String`     | `String @default(cuid())`                       | cuid v1 — collision-resistant ID         | All               |
| `cuid(2)`             | `String`     | `String @default(cuid(2))`                      | cuid v2 — newer, shorter                 | All               |
| `uuid()`              | `String`     | `String @default(uuid())`                       | UUID v4 string                           | All               |
| `uuid(7)`             | `String`     | `String @default(uuid(7))`                      | UUID v7 — time-sortable                  | All               |
| `now()`               | `DateTime`   | `DateTime @default(now())`                      | Current UTC timestamp at creation        | All               |
| `dbgenerated()`       | any          | `@default(dbgenerated("gen_random_uuid()"))`    | Raw database-level default expression    | All               |
| Literal value         | matches type | `Boolean @default(false)`, `Int @default(0)`    | A hardcoded literal value                | All               |

```prisma
model User {
  // Integer PKs
  id         Int      @id @default(autoincrement())

  // String IDs — choose one style:
  cuidId     String   @default(cuid())          // "clxxxxxxxxxx"  (cuid v1)
  cuid2Id    String   @default(cuid(2))         // shorter, newer
  uuidId     String   @default(uuid())          // "550e8400-e29b-..."  (v4)
  uuid7Id    String   @default(uuid(7))         // time-sortable UUID v7

  // Timestamps
  createdAt  DateTime @default(now())           
  updatedAt  DateTime @updatedAt               

  // Literals
  isActive   Boolean  @default(true)
  score      Int      @default(0)
  role       String   @default("user")

  // Raw DB expression
  rawId      String   @default(dbgenerated("gen_random_uuid()")) @db.Uuid
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/reference/prisma-schema-reference#default

---

### 6.3 `@relation()` — All Arguments

| Argument      | Type       | Description                                                                 |
|---------------|------------|-----------------------------------------------------------------------------|
| `fields:`     | field[]    | FK fields on **this** model                                                 |
| `references:` | field[]    | Fields on the **referenced** model (usually `[id]`)                         |
| `name:`       | String     | Disambiguates when two models have multiple relations between them           |
| `onDelete:`   | Action     | What happens to **this record** when the referenced record is deleted       |
| `onUpdate:`   | Action     | What happens to **this record** when the referenced record is updated       |
| `map:`        | String     | Custom name for the FK constraint in the DB                                 |

### Referential Actions (`onDelete` / `onUpdate`)

| Action       | Description                                                      | Default?     |
|--------------|------------------------------------------------------------------|--------------|
| `Cascade`    | Delete/update this record when parent is deleted/updated         |              |
| `Restrict`   | Prevent deleting/updating parent if children exist               |              |
| `NoAction`   | Like Restrict but deferred; DB-level behaviour varies            | ✅ (onDelete)|
| `SetNull`    | Set the FK field to `null` (field must be optional `?`)          |              |
| `SetDefault` | Set the FK field to its `@default()` value                       |              |

```prisma
model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(
    fields:     [authorId],  
    references: [id],
    onDelete:   Cascade,    // ← delete Post when User is deleted
    onUpdate:   Cascade,    // ← update authorId when User.id changes
    map:        "fk_post_author"  // ← custom FK constraint name in DB
  )
  authorId Int
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions

---

## 7. Model Attributes (`@@`)

Model attributes apply to the **entire model** (table-level). Prefixed with `@@`.

### 7.1 All Model Attributes

| Attribute      | Example                          | Description                                              | Support        |
|----------------|----------------------------------|----------------------------------------------------------|----------------|
| `@@id()`       | `@@id([firstName, lastName])`    | **Composite primary key** (replaces `@id`)               | Relational DBs |
| `@@unique()`   | `@@unique([email, username])`    | **Composite unique** — the combination must be unique    | All            |
| `@@index()`    | `@@index([createdAt, authorId])` | **DB index** for faster queries on these fields          | All            |
| `@@map()`      | `@@map("users")`                 | Maps model to a different **table / collection name**    | All            |
| `@@ignore`     | `@@ignore`                       | Exclude model from Prisma Client (still in DB)           | All            |
| `@@schema()`   | `@@schema("auth")`               | Assigns to a specific DB schema (multi-schema)           | PostgreSQL etc.|
| `@@fulltext()` | `@@fulltext([title, content])`   | Full-text search index                                   | MySQL, MongoDB |

```prisma
model UserProfile {
  firstName String
  lastName  String
  email     String
  username  String

  @@id([firstName, lastName])       // composite PK
  @@unique([email, username])       // composite unique
  @@index([lastName, firstName])    // composite index
  @@map("user_profiles")            // DB table name
}
```

---

### 7.2 `@@index()` Types

```prisma
model Post {
  id        Int      @id
  title     String
  content   String
  createdAt DateTime @default(now())
  authorId  Int

  // Standard index
  @@index([authorId])

  // Composite index — order matters for query optimizer
  @@index([authorId, createdAt])

  // Index with custom DB name
  @@index([createdAt], map: "idx_post_created_at")

  // Full-text search index (MySQL only)
  // @@fulltext([title, content])
}
```

---

### 7.3 Advanced Attribute Arguments

#### `map:` — Custom DB Constraint / Index Name

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String
  nickname String

  // Prisma auto-name: "User_email_nickname_key"
  // Custom name:      "uq_user_email_nickname"
  @@unique([email, nickname], map: "uq_user_email_nickname")

  @@index([nickname], map: "idx_user_nickname")
}
```

> 💡 Use `map:` for **readable migration SQL** and to match legacy DB constraint names.

---

#### `name:` — Custom TypeScript Field Name for Composite Keys

```prisma
model UserProfile {
  firstName String
  lastName  String

  // Without name: → Prisma Client uses { firstName_lastName: { ... } }
  // With name:    → Prisma Client uses { fullName: { firstName, lastName } }
  @@id([firstName, lastName], name: "fullName")
}

// ✅ TypeScript usage:
// prisma.userProfile.findUnique({
//   where: {
//     fullName: { firstName: "John", lastName: "Doe" }
//   }
// })
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-attributes

---

## 8. Relations

Relations link two models. Prisma supports **one-to-one**, **one-to-many**, and **many-to-many**.

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/relations

---

### 8.1 One-to-Many (Most Common)

```prisma
// One User → Many Posts
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]   // ← virtual relation field — no DB column, Prisma-only
}

model Post {
  id       Int  @id @default(autoincrement())
  authorId Int                                                   // ← FK column in DB
  author   User @relation(fields: [authorId], references: [id]) // ← declares the relation
}
```

> 📌 **Rule:** The model that holds the **foreign key** (`authorId`) must declare `@relation()`.

---

### 8.2 One-to-One

```prisma
// One User → One Profile (optional)
model User {
  id      Int      @id @default(autoincrement())
  profile Profile? // ← optional: user may or may not have a profile
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  userId Int    @unique  // ← @unique enforces one-to-one
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### 8.3 Many-to-Many — Implicit (Auto Join Table)

Prisma automatically creates a hidden join table `_PostToTag`:

```prisma
model Post {
  id   Int   @id @default(autoincrement())
  tags Tag[] // ← relation field only
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[] // ← relation field only
}
// Auto-created: _PostToTag (postId, tagId)
```

---

### 8.4 Many-to-Many — Explicit (Custom Join Table)

Use this when you need **extra fields** on the join table:

```prisma
model Post {
  id         Int         @id @default(autoincrement())
  categories PostCategory[]
}

model Category {
  id    Int           @id @default(autoincrement())
  name  String        @unique
  posts PostCategory[]
}

// Explicit join table with extra fields
model PostCategory {
  postId     Int
  categoryId Int
  assignedAt DateTime @default(now())  // ← extra field on the join
  assignedBy String                    // ← extra field on the join

  post     Post     @relation(fields: [postId],     references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@id([postId, categoryId])           // ← composite PK on join table
  @@map("post_categories")
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations

---

### 8.5 Self-Relation (A model relates to itself)

```prisma
// Employee hierarchy: each employee can have one manager
model Employee {
  id         Int        @id @default(autoincrement())
  name       String
  managerId  Int?
  manager    Employee?  @relation("EmployeeToManager", fields: [managerId], references: [id])
  reports    Employee[] @relation("EmployeeToManager")
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/self-relations

---

### 8.6 Disambiguating Multiple Relations

When two models have **more than one relation** between them, you must give each a unique `name:`:

```prisma
model User {
  id             Int    @id
  writtenPosts   Post[] @relation("WrittenPosts")
  pinnedPost     Post?  @relation("PinnedPost")
}

model Post {
  id          Int   @id
  authorId    Int
  author      User  @relation("WrittenPosts", fields: [authorId], references: [id])
  pinnedById  Int?
  pinnedBy    User? @relation("PinnedPost",   fields: [pinnedById], references: [id])
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/disambiguating-relations

---

## 9. Enums

Enums define a **fixed set of allowed string values** for a field.

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
  SUPER_ADMIN
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model User {
  id     Int      @id @default(autoincrement())
  role   Role     @default(USER)
  status PostStatus @default(DRAFT)
}
```

### Enum Value Mapping

```prisma
enum Direction {
  NORTH @map("N")
  SOUTH @map("S")
  EAST  @map("E")
  WEST  @map("W")

  @@map("compass_direction")
}
```

### Database Support for Enums

| Database    | Native Enum | Alternative             |
|-------------|-------------|-------------------------|
| PostgreSQL  | ✅ Yes       | —                       |
| MySQL       | ✅ Yes       | —                       |
| SQLite      | ❌ No        | Store as `String`       |
| MongoDB     | ❌ No        | Store as `String`       |
| SQL Server  | ❌ No        | Store as `String`       |
| CockroachDB | ✅ Yes       | —                       |

> 📚 **Docs:** https://www.prisma.io/docs/orm/reference/prisma-schema-reference#enum

---

## 10. Views

A **view** maps to a read-only database view. Prisma generates read queries for it, but no mutations.

```prisma
// Must be enabled in the generator:
generator client {
  provider        = "prisma-client"
  output          = "../generated/prisma"
  previewFeatures = ["views"]   // ← enable views preview
}

// Define the view (must already exist in your DB)
view UserOverview {
  id        Int    @unique      // ← at least one @unique required
  email     String
  postCount Int

  @@map("user_overview")        // ← must match the DB view name
}
```

```typescript
// ✅ Usage in Prisma Client (read-only):
const overviews = await prisma.userOverview.findMany({
  where: { postCount: { gt: 5 } },
  orderBy: { postCount: "desc" },
});
```

> ⚠️ Views are **read-only** — no `create`, `update`, or `delete`.  
> The view must **already exist** in the database (Prisma does not create views via migrate).

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/views

---

## 11. Multi-Schema Support

Use `@@schema()` to assign models to different **PostgreSQL schemas** (e.g. `public`, `auth`).

```prisma
// Enable in datasource & generator
datasource db {
  provider = "postgresql"
  schemas  = ["public", "auth"]   // ← declare all schemas used
}

generator client {
  provider        = "prisma-client"
  output          = "../generated/prisma"
  previewFeatures = ["multiSchema"]
}

// Models in different schemas
model User {
  id    Int    @id @default(autoincrement())
  email String @unique

  @@schema("public")    // ← lives in the "public" schema
}

model Session {
  id     Int    @id @default(autoincrement())
  userId Int

  @@schema("auth")      // ← lives in the "auth" schema
}
```

> 📚 **Docs:** https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema

---

## 12. Generator Options

The `generator` block controls what Prisma generates and how.

```prisma
generator client {
  provider        = "prisma-client"         // Prisma 7 generator name
  output          = "../generated/prisma"   // where to write the client
  previewFeatures = ["views", "multiSchema"] // opt-in to preview features
  binaryTargets   = ["native", "linux-musl"] // for Docker/serverless deploys
}
```

### Common Generator Options

| Option             | Example Value                    | Description                                          |
|--------------------|----------------------------------|------------------------------------------------------|
| `provider`         | `"prisma-client"`                | Generator to use (Prisma 7)                          |
| `output`           | `"../generated/prisma"`          | Where to write the generated Client                  |
| `previewFeatures`  | `["views", "multiSchema"]`       | Opt into preview/experimental features               |
| `binaryTargets`    | `["native", "linux-musl-openssl-3.0.x"]` | OS targets for query engine binary         |

### Preview Features Reference

| Feature        | Description                                      |
|----------------|--------------------------------------------------|
| `views`        | Support for database views                       |
| `multiSchema`  | Multiple database schemas in one Prisma project  |
| `fullTextSearch` | Full-text search via `search` filter           |
| `driverAdapters` | Use custom driver adapters (required in Prisma 7)|

> 📚 **Docs:** https://www.prisma.io/docs/orm/reference/prisma-schema-reference#generator

---

## 13. Real-World Example

A complete schema for a blog app — combining everything above:

```prisma
// ────────────────────────────────────────────────────────────────
// Generator & Datasource
// ────────────────────────────────────────────────────────────────
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  // url & directUrl are in prisma7.config.ts
}

// ────────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────────
enum Role {
  USER
  ADMIN
  MODERATOR
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ────────────────────────────────────────────────────────────────
// Models
// ────────────────────────────────────────────────────────────────
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  name      String?
  role      Role       @default(USER)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relations
  posts     Post[]     // one-to-many: a user has many posts
  profile   Profile?   // one-to-one:  a user has one profile

  @@map("users")
  @@index([email])
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String? @db.Text
  avatar String?
  userId Int     @unique             // @unique = one-to-one
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id        Int        @id @default(autoincrement())
  title     String     @db.VarChar(255)
  content   String?    @db.Text
  status    PostStatus @default(DRAFT)
  published Boolean    @default(false)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // FK
  authorId  Int
  author    User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // Many-to-many with Tag (implicit)
  tags      Tag[]

  @@map("posts")
  @@index([authorId])
  @@index([status, createdAt])
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique @db.VarChar(50)
  posts Post[]

  @@map("tags")
}

// ────────────────────────────────────────────────────────────────
// View (read-only, must exist in DB)
// ────────────────────────────────────────────────────────────────
// view UserPostCount {
//   id        Int    @unique
//   email     String
//   postCount Int
//   @@map("user_post_count")
// }
```

---

## 14. Quick Reference Card

```prisma
─── SCHEMA BLOCKS ─────────────────────────────────────────────────────
generator  { provider output previewFeatures binaryTargets }
datasource { provider url directUrl schemas }
model      { fields attributes }
enum       { values }
view       { fields — read-only }

─── FIELD TYPE MODIFIERS ──────────────────────────────────────────────
String          → required (NOT NULL)
String?         → optional (NULL)
String[]        → list / array  (❌ not in SQLite)

─── FIELD ATTRIBUTES (@) ──────────────────────────────────────────────
@id                    → primary key
@unique                → unique constraint
@default(value/fn())   → default value
@updatedAt             → auto-update timestamp
@relation(...)         → define relation
@map("col_name")       → rename column in DB
@ignore                → exclude from Prisma Client
@db.TypeName           → native DB column type

─── DEFAULT FUNCTIONS ──────────────────────────────────────────────────
autoincrement()   → 1, 2, 3 ...
cuid()            → cuid v1 unique string
cuid(2)           → cuid v2 (shorter, newer)
uuid()            → UUID v4 string
uuid(7)           → UUID v7 (time-sortable)
now()             → current UTC timestamp
dbgenerated("…")  → raw DB expression

─── MODEL ATTRIBUTES (@@) ─────────────────────────────────────────────
@@id([f1, f2])              → composite primary key
@@unique([f1, f2])          → composite unique constraint
@@index([f1, f2])           → DB index
@@map("table_name")         → rename table in DB
@@ignore                    → exclude model from Client
@@schema("schema_name")     → assign to a DB schema
@@fulltext([f1, f2])        → full-text index (MySQL/MongoDB)

─── ATTRIBUTE ARGUMENTS ───────────────────────────────────────────────
map:  "name"       → custom constraint/index name in DB
name: "alias"      → TypeScript alias for composite key

─── @relation() ARGUMENTS ─────────────────────────────────────────────
fields:     [localField]     → FK fields on THIS model
references: [remoteField]    → fields on the RELATED model
name:       "RelationName"   → disambiguate multiple relations
onDelete:   Cascade|Restrict|SetNull|SetDefault|NoAction
onUpdate:   Cascade|Restrict|SetNull|SetDefault|NoAction
map:        "fk_name"        → custom FK constraint name in DB

─── RELATION TYPES ────────────────────────────────────────────────────
One-to-Many   → Post[] on User  +  author User @relation on Post
One-to-One    → Profile? on User  +  @unique on FK in Profile
Many-to-Many  → Post[] on Tag   +  Tag[] on Post  (implicit join table)
              → explicit: separate model with @@id([a, b])
Self-relation → Employee? @relation("name") on same model
```

---

## 15. Official Reference Links

| Topic | URL |
|-------|-----|
| **PSL Overview** | https://www.prisma.io/docs/orm/prisma-schema/overview |
| **Data Model** | https://www.prisma.io/docs/orm/prisma-schema/data-model/models |
| **Scalar Types** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-field-scalar-types |
| **Field Attributes** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#attributes |
| **Model Attributes** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-attributes |
| **Default Values** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#default |
| **Relations Overview** | https://www.prisma.io/docs/orm/prisma-schema/data-model/relations |
| **One-to-One** | https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-one-relations |
| **One-to-Many** | https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations |
| **Many-to-Many** | https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations |
| **Self-Relations** | https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/self-relations |
| **Disambiguating Relations** | https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/disambiguating-relations |
| **Referential Actions** | https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions |
| **Enums** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#enum |
| **Views** | https://www.prisma.io/docs/orm/prisma-schema/data-model/views |
| **Multi-Schema** | https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema |
| **Native DB Types** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-field-scalar-types |
| **PostgreSQL** | https://www.prisma.io/docs/orm/overview/databases/postgresql |
| **MySQL** | https://www.prisma.io/docs/orm/overview/databases/mysql |
| **SQLite** | https://www.prisma.io/docs/orm/overview/databases/sqlite |
| **MongoDB** | https://www.prisma.io/docs/orm/overview/databases/mongodb |
| **Naming Conventions** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#naming-conventions |
| **Generator Reference** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#generator |
| **Prisma Config (v7)** | https://www.prisma.io/docs/orm/reference/prisma-config-reference |
| **Full Schema Reference** | https://www.prisma.io/docs/orm/reference/prisma-schema-reference |