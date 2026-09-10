# 🗃️ How to Write Prisma Queries — Complete Guide

> **Goal:** Master every type of Prisma Client query — step by step with real examples.  
> All examples use the **User** & **Post** models from this project.

---

## 📌 Table of Contents

1. [The Schema & Setup](#1-the-schema--setup)
2. [CREATE Queries](#2-create-queries)
   - `create` · `createMany` · `createManyAndReturn` · Nested create
3. [READ Queries](#3-read-queries)
   - `findUnique` · `findUniqueOrThrow` · `findFirst` · `findFirstOrThrow` · `findMany` · `count` · `aggregate` · `groupBy`
4. [UPDATE Queries](#4-update-queries)
   - `update` · `updateMany` · `updateManyAndReturn` · `upsert`
5. [DELETE Queries](#5-delete-queries)
   - `delete` · `deleteMany`
6. [Filtering — `where` Operators](#6-filtering--where-operators)
7. [Sorting — `orderBy`](#7-sorting--orderby)
8. [Pagination — `skip`, `take`, `cursor`](#8-pagination--skip-take-cursor)
9. [Field Selection — `select`](#9-field-selection--select)
10. [Relations — `include`](#10-relations--include)
11. [Nested Writes](#11-nested-writes)
12. [Transactions — `$transaction`](#12-transactions--transaction)
13. [Raw Queries — `$queryRaw` & `$executeRaw`](#13-raw-queries--queryraw--executeraw)
14. [Quick Reference Card](#14-quick-reference-card)
15. [Official Reference Links](#15-official-reference-links)

---

## 1. The Schema & Setup

### Your Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

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

### Prisma Client Import (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from "../../generated/prisma";

export const prisma = new PrismaClient();
```

### Script Entry Point (`src/script.ts`)

```typescript
import { prisma } from "./lib/prisma";

async function main() {
  // ✅ All queries go here
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

> 📚 **Docs:** [Prisma Client Setup & Configuration](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction) · [Generating Prisma Client](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)

---

## 2. CREATE Queries

> 📚 **Docs:** [Prisma CRUD — Create Records](https://www.prisma.io/docs/orm/prisma-client/queries/crud#create) · [createMany](https://www.prisma.io/docs/orm/prisma-client/queries/crud#create-multiple-records) · [createManyAndReturn](https://www.prisma.io/docs/orm/prisma-client/queries/crud#create-multiple-records-and-return-the-created-records)

### 2.1 `create()` — Create a Single Record

```typescript
// ── Create a User ────────────────────────────────────────────────
const newUser = await prisma.user.create({
  data: {
    name:  "Alice",
    email: "alice@prisma.io",
  },
});
console.log(newUser);
// { id: 1, name: 'Alice', email: 'alice@prisma.io' }
```

```typescript
// ── Create a Post linked to an existing User ─────────────────────
const newPost = await prisma.post.create({
  data: {
    title:     "Hello World",
    content:   "This is my first post!",
    published: true,
    authorId:  1,             // ← FK — must match an existing User id
  },
});
console.log(newPost);
// { id: 1, title: 'Hello World', content: '...', published: true, authorId: 1 }
```

---

### 2.2 `create()` with `include` — Return Related Data

```typescript
// ── Create a User AND return their posts in the same response ────
const user = await prisma.user.create({
  data: {
    name:  "Alice2",
    email: "alice2@prisma.io",
    posts: {
      create: {
        title:     "Hello World2",
        content:   "This is my second post!",
        published: true,
      },
    },
  },
  include: {
    posts: true,   // ← attach related posts to response
  },
});
console.log("Created user:", user);
// {
//   id: 2, name: 'Alice2', email: 'alice2@prisma.io',
//   posts: [{ id: 2, title: 'Hello World2', ... }]
// }
```

---

### 2.3 `createMany()` — Insert Multiple Records

```typescript
// ── Create many Users in one query ──────────────────────────────
const result = await prisma.user.createMany({
  data: [
    { name: "Bob",   email: "bob@prisma.io"   },
    { name: "Carol", email: "carol@prisma.io" },
    { name: "Dave",  email: "dave@prisma.io"  },
  ],
  skipDuplicates: true, // ← skip if email already exists (no error)
});
console.log(result);
// { count: 3 }
```

> ⚠️ `createMany()` returns `{ count: N }` — **not** the created records.  
> It also does **not** support nested relations (no `posts: { create: ... }` inside).

---

### 2.4 `createManyAndReturn()` — Insert Many & Return Records

```typescript
// ── Create many Posts and get back the inserted rows ─────────────
const posts = await prisma.post.createManyAndReturn({
  data: [
    { title: "Post A", authorId: 1 },
    { title: "Post B", authorId: 1 },
    { title: "Post C", authorId: 2 },
  ],
  select: {
    id:    true,
    title: true,
  },
});
console.log(posts);
// [ { id: 3, title: 'Post A' }, { id: 4, title: 'Post B' }, ... ]
```

---

## 3. READ Queries

> 📚 **Docs:** [Prisma CRUD — Read Records](https://www.prisma.io/docs/orm/prisma-client/queries/crud#read) · [Aggregations & Grouping](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing)

### 3.1 `findUnique()` — Find One by Unique Field

```typescript
// ── Find User by id ──────────────────────────────────────────────
const user = await prisma.user.findUnique({
  where: { id: 1 },
});
// Returns the record OR null if not found

// ── Find User by email (also @unique) ───────────────────────────
const userByEmail = await prisma.user.findUnique({
  where: { email: "alice@prisma.io" },
});
```

---

### 3.2 `findUniqueOrThrow()` — Find One or Throw Error

```typescript
// ── Throws PrismaClientKnownRequestError if NOT found ───────────
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 999 },  // ← id 999 doesn't exist → throws!
});
// Use this when you are 100% sure the record must exist
```

> 💡 Use `findUniqueOrThrow` when a missing record means something went wrong (e.g. in an API handler).  
> Use `findUnique` when a missing record is a valid state (returns `null`).

---

### 3.3 `findFirst()` — Find First Matching Record

```typescript
// ── Find the first published Post ───────────────────────────────
const firstPublished = await prisma.post.findFirst({
  where:   { published: true },
  orderBy: { id: "desc" },     // ← get the LATEST published post
});
// Returns the record OR null
```

---

### 3.4 `findFirstOrThrow()` — Find First or Throw Error

```typescript
// ── Throws if no match is found ─────────────────────────────────
const post = await prisma.post.findFirstOrThrow({
  where: { published: true, authorId: 1 },
});
```

---

### 3.5 `findMany()` — Find All Matching Records

```typescript
// ── Get ALL users ────────────────────────────────────────────────
const allUsers = await prisma.user.findMany();
console.log(allUsers);
// [ { id: 1, ... }, { id: 2, ... }, ... ]

// ── Get all PUBLISHED posts ──────────────────────────────────────
const publishedPosts = await prisma.post.findMany({
  where:   { published: true },
  orderBy: { id: "desc" },
  take:    10,
});
```

```typescript
// ── Get all users WITH their posts (from script.ts) ──────────────
const allUsers = await prisma.user.findMany({
  include: { posts: true },
});
console.log("All users:", JSON.stringify(allUsers, null, 2));
```

---

### 3.6 `count()` — Count Matching Records

```typescript
// ── Count ALL users ──────────────────────────────────────────────
const totalUsers = await prisma.user.count();
console.log(totalUsers);  // 5

// ── Count only published posts ───────────────────────────────────
const publishedCount = await prisma.post.count({
  where: { published: true },
});
console.log(publishedCount);  // 3
```

---

### 3.7 `aggregate()` — Calculate Min, Max, Avg, Sum, Count

```typescript
// ── Aggregate on Post id (numeric field) ────────────────────────
const stats = await prisma.post.aggregate({
  _count: { id: true },   // total number of posts
  _min:   { id: true },   // smallest id
  _max:   { id: true },   // largest id
  where:  { published: true },
});

console.log(stats);
// { _count: { id: 5 }, _min: { id: 1 }, _max: { id: 9 } }
```

---

### 3.8 `groupBy()` — Group Records & Aggregate

```typescript
// ── Count how many posts each author has ─────────────────────────
const postsByAuthor = await prisma.post.groupBy({
  by:      ["authorId"],         // ← group by this field
  _count:  { id: true },         // ← count posts per group
  orderBy: { _count: { id: "desc" } }, // ← most posts first
});

console.log(postsByAuthor);
// [
//   { authorId: 1, _count: { id: 4 } },
//   { authorId: 2, _count: { id: 2 } },
// ]
```

```typescript
// ── Group published vs unpublished posts ─────────────────────────
const grouped = await prisma.post.groupBy({
  by:     ["published"],
  _count: { id: true },
});
// [ { published: true, _count: { id: 7 } }, { published: false, _count: { id: 3 } } ]
```

---

## 4. UPDATE Queries

> 📚 **Docs:** [Prisma CRUD — Update Records](https://www.prisma.io/docs/orm/prisma-client/queries/crud#update) · [updateMany](https://www.prisma.io/docs/orm/prisma-client/queries/crud#update-multiple-records) · [upsert](https://www.prisma.io/docs/orm/prisma-client/queries/crud#upsert) · [Atomic Number Operations](https://www.prisma.io/docs/orm/prisma-client/queries/crud#atomic-number-operations)

### 4.1 `update()` — Update a Single Record

```typescript
// ── Update a User's name ─────────────────────────────────────────
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data:  { name: "Alice Smith" },
});
console.log(updatedUser);
// { id: 1, email: 'alice@prisma.io', name: 'Alice Smith' }
```

```typescript
// ── Publish a Post ───────────────────────────────────────────────
const publishedPost = await prisma.post.update({
  where: { id: 1 },
  data:  { published: true },
});
```

```typescript
// ── Increment / Decrement a numeric field ────────────────────────
// (works on Int, Float, BigInt, Decimal fields)
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    // Imagine a "views" Int field:
    // views: { increment: 1 }   // views + 1
    // views: { decrement: 1 }   // views - 1
    // views: { multiply: 2 }    // views × 2
    // views: { divide: 2 }      // views ÷ 2
    // views: { set: 100 }       // views = 100

    // For our schema:
    authorId: { set: 2 },       // reassign post to author id: 2
  },
});
```

> ⚠️ `update()` **throws** if the record is not found. Use `updateMany()` to safely skip missing records.

---

### 4.2 `updateMany()` — Update Multiple Records

```typescript
// ── Publish ALL posts by User id: 1 ─────────────────────────────
const result = await prisma.post.updateMany({
  where: { authorId: 1, published: false },
  data:  { published: true },
});
console.log(result);
// { count: 3 }   ← number of rows updated
```

```typescript
// ── Unpublish ALL posts ───────────────────────────────────────────
const result = await prisma.post.updateMany({
  data: { published: false },  // ← no where = applies to ALL rows
});
```

---

### 4.3 `updateManyAndReturn()` — Update Many & Return Records

```typescript
// ── Update and get the changed rows back ─────────────────────────
const updatedPosts = await prisma.post.updateManyAndReturn({
  where: { authorId: 1 },
  data:  { published: true },
  select: {
    id:        true,
    title:     true,
    published: true,
  },
});
console.log(updatedPosts);
// [ { id: 1, title: 'Post A', published: true }, ... ]
```

---

### 4.4 `upsert()` — Update if Exists, Create if Not

```typescript
// ── Upsert a User by unique email ────────────────────────────────
const user = await prisma.user.upsert({
  where:  { email: "alice@prisma.io" },   // ← check this unique field
  update: { name: "Alice Updated" },       // ← if FOUND: do this
  create: {                                // ← if NOT FOUND: do this
    email: "alice@prisma.io",
    name:  "Alice New",
  },
});
console.log(user);
// If found  → updated record
// If not    → newly created record
```

> 💡 **upsert** = **up**date + in**sert**.  
> Perfect for syncing data (e.g., seed scripts, third-party API sync).

---

## 5. DELETE Queries

> 📚 **Docs:** [Prisma CRUD — Delete Records](https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete) · [deleteMany](https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete-multiple-records)

### 5.1 `delete()` — Delete a Single Record

```typescript
// ── Delete a Post by id ──────────────────────────────────────────
const deleted = await prisma.post.delete({
  where: { id: 5 },
});
console.log(deleted);
// Returns the deleted record object

// ── Delete a User by unique email ────────────────────────────────
const deletedUser = await prisma.user.delete({
  where: { email: "bob@prisma.io" },
});
```

> ⚠️ `delete()` **throws** if the record is not found.

---

### 5.2 `deleteMany()` — Delete Multiple Records

```typescript
// ── Delete all DRAFT (unpublished) posts ─────────────────────────
const result = await prisma.post.deleteMany({
  where: { published: false },
});
console.log(result);
// { count: 4 }

// ── Delete ALL posts of a specific author ────────────────────────
const result2 = await prisma.post.deleteMany({
  where: { authorId: 1 },
});

// ── Delete ALL records in a table ────────────────────────────────
const result3 = await prisma.post.deleteMany({});
// { count: 100 }  ← empties the table (⚠️ use with caution!)
```

---

## 6. Filtering — `where` Operators

> 📚 **Docs:** [Filtering & Sorting](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting) · [Case Sensitivity](https://www.prisma.io/docs/orm/prisma-client/queries/case-sensitivity) · [Relation Filters](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#filter-on-relations-to-a-relation-list)

### 6.1 Exact Match

```typescript
const posts = await prisma.post.findMany({
  where: { published: true },
});
```

---

### 6.2 String Filters

| Operator      | SQL equivalent     | Description                     |
|---------------|--------------------|---------------------------------|
| `equals`      | `= 'value'`        | Exact match                     |
| `not`         | `!= 'value'`       | Not equal                       |
| `contains`    | `LIKE '%value%'`   | Contains the string             |
| `startsWith`  | `LIKE 'value%'`    | Starts with the string          |
| `endsWith`    | `LIKE '%value'`    | Ends with the string            |
| `in`          | `IN ('a','b')`     | Matches any in the list         |
| `notIn`       | `NOT IN (...)`     | Matches none in the list        |
| `mode`        | (modifier)         | `"insensitive"` for case-ignore |

```typescript
const posts = await prisma.post.findMany({
  where: {
    title: {
      contains:    "Prisma",       // LIKE '%Prisma%'
      // startsWith: "Hello",      // LIKE 'Hello%'
      // endsWith:   "Guide",      // LIKE '%Guide'
      // equals:     "My Post",    // = 'My Post'
      mode: "insensitive",         // case-insensitive
    },
  },
});
```

```typescript
// ── Exact OR list match ──────────────────────────────────────────
const posts = await prisma.post.findMany({
  where: {
    title: { in: ["Hello World", "Hello World2", "Hello World3"] },
  },
});
```

---

### 6.3 Number / ID Filters

| Operator | SQL   | Meaning              |
|----------|-------|----------------------|
| `equals` | `=`   | Equal                |
| `not`    | `!=`  | Not equal            |
| `gt`     | `>`   | Greater than         |
| `gte`    | `>=`  | Greater than or equal|
| `lt`     | `<`   | Less than            |
| `lte`    | `<=`  | Less than or equal   |
| `in`     | `IN`  | Matches any in list  |
| `notIn`  | `NOT IN` | Matches none      |

```typescript
// Posts with id greater than 3
const posts = await prisma.post.findMany({
  where: { id: { gt: 3 } },
});

// Posts with id between 2 and 8 (inclusive)
const rangePosts = await prisma.post.findMany({
  where: {
    id: { gte: 2, lte: 8 },
  },
});
```

---

### 6.4 `AND` — All Conditions Must Match

```typescript
// Published posts written by authorId: 1
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      { authorId: 1 },
    ],
  },
});

// ── Shorthand (implicit AND) ─────────────────────────────────────
const posts2 = await prisma.post.findMany({
  where: {
    published: true,
    authorId:  1,
  },
});
```

---

### 6.5 `OR` — Any Condition Must Match

```typescript
// Users named "Alice" OR whose email contains "carol"
const users = await prisma.user.findMany({
  where: {
    OR: [
      { name:  "Alice" },
      { email: { contains: "carol" } },
    ],
  },
});
```

---

### 6.6 `NOT` — Condition Must NOT Match

```typescript
// All posts that are NOT published (draft posts)
const drafts = await prisma.post.findMany({
  where: {
    NOT: { published: true },
  },
});

// Users who do NOT have the name "Dave"
const users = await prisma.user.findMany({
  where: {
    NOT: { name: "Dave" },
  },
});
```

---

### 6.7 Nested `AND` + `OR` + `NOT`

```typescript
// Posts that are published
// AND (title contains "Hello" OR authorId is 2)
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      {
        OR: [
          { title:    { contains: "Hello" } },
          { authorId: 2 },
        ],
      },
    ],
  },
});
```

---

### 6.8 Null Checks

```typescript
// Users with NO name (name is null)
const noName = await prisma.user.findMany({
  where: { name: null },
});

// Users who HAVE a name (name is not null)
const hasName = await prisma.user.findMany({
  where: { name: { not: null } },
});

// Posts with no content
const noPosts = await prisma.post.findMany({
  where: { content: null },
});
```

---

### 6.9 Relation Filters — `some`, `every`, `none`

```typescript
// Users who have AT LEAST ONE published post
const usersWithPublished = await prisma.user.findMany({
  where: {
    posts: {
      some: { published: true },
    },
  },
});

// Users where ALL posts are published
const allPublished = await prisma.user.findMany({
  where: {
    posts: {
      every: { published: true },
    },
  },
});

// Users who have NO published posts
const nonePublished = await prisma.user.findMany({
  where: {
    posts: {
      none: { published: true },
    },
  },
});

// Users who have NO posts at all
const noPostsAtAll = await prisma.user.findMany({
  where: {
    posts: { none: {} },
  },
});
```

---

### 6.10 `is` / `isNot` — Filter by Related Model Fields

```typescript
// Posts whose author is named "Alice"
const posts = await prisma.post.findMany({
  where: {
    author: {
      is: { name: "Alice" },
    },
  },
});

// Posts whose author is NOT named "Bob"
const posts2 = await prisma.post.findMany({
  where: {
    author: {
      isNot: { name: "Bob" },
    },
  },
});
```

---

## 7. Sorting — `orderBy`

> 📚 **Docs:** [Sorting Records with orderBy](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#sort-records) · [Sort by Relation](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#sort-by-relation-fields)

### 7.1 Single Field Sort

```typescript
// ── Oldest posts first ───────────────────────────────────────────
const asc = await prisma.post.findMany({
  orderBy: { id: "asc" },
});

// ── Newest posts first ───────────────────────────────────────────
const desc = await prisma.post.findMany({
  orderBy: { id: "desc" },
});
```

---

### 7.2 Multi-Field Sort

```typescript
// First sort by published (true first), then by id descending
const sorted = await prisma.post.findMany({
  orderBy: [
    { published: "desc" },  // published=true first
    { id:        "desc" },  // then newest first
  ],
});
```

---

### 7.3 Sort by Related Field

```typescript
// Sort posts by their author's name (alphabetically)
const posts = await prisma.post.findMany({
  orderBy: {
    author: { name: "asc" },
  },
});
```

---

### 7.4 Sort by Relation Count

```typescript
// Sort users by how many posts they have (most posts first)
const users = await prisma.user.findMany({
  orderBy: {
    posts: { _count: "desc" },
  },
});
```

---

## 8. Pagination — `skip`, `take`, `cursor`

> 📚 **Docs:** [Prisma Pagination Guide](https://www.prisma.io/docs/orm/prisma-client/queries/pagination) · [Offset Pagination](https://www.prisma.io/docs/orm/prisma-client/queries/pagination#offset-pagination) · [Cursor-based Pagination](https://www.prisma.io/docs/orm/prisma-client/queries/pagination#cursor-based-pagination)

### 8.1 Offset Pagination (`skip` + `take`)

```typescript
const PAGE_SIZE = 5;

// ── Page 1 → records 1-5 ─────────────────────────────────────────
const page1 = await prisma.post.findMany({
  skip:    0,
  take:    PAGE_SIZE,
  orderBy: { id: "asc" },
});

// ── Page 2 → records 6-10 ────────────────────────────────────────
const page2 = await prisma.post.findMany({
  skip:    5,
  take:    PAGE_SIZE,
  orderBy: { id: "asc" },
});

// ── Generic formula ───────────────────────────────────────────────
const pageNumber = 3;
const pageN = await prisma.post.findMany({
  skip:    (pageNumber - 1) * PAGE_SIZE,   // (3-1)*5 = 10
  take:    PAGE_SIZE,                       // take 5 → records 11-15
  orderBy: { id: "asc" },
});
```

| Page | `skip`   | `take` | Records  |
|------|----------|--------|----------|
| 1    | 0        | 5      | 1 – 5    |
| 2    | 5        | 5      | 6 – 10   |
| 3    | 10       | 5      | 11 – 15  |
| N    | (N-1)×5  | 5      | …        |

---

### 8.2 Cursor Pagination (Infinite Scroll / API Style)

```typescript
// ── First page (no cursor) ────────────────────────────────────────
const firstPage = await prisma.post.findMany({
  take:    5,
  orderBy: { id: "asc" },
});

// ── Next page — start AFTER the last item's id ───────────────────
const lastId = firstPage[firstPage.length - 1].id;  // e.g. 5

const nextPage = await prisma.post.findMany({
  take:   5,
  skip:   1,           // ← skip the cursor record itself
  cursor: { id: lastId },
  orderBy: { id: "asc" },
});
```

> 💡 **Cursor pagination** is more efficient than `skip`/`take` for large datasets  
> because it uses an index to find the starting point rather than scanning rows.

---

## 9. Field Selection — `select`

> 📚 **Docs:** [Select Fields](https://www.prisma.io/docs/orm/prisma-client/queries/select-fields) · [Relation Count with _count](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing#count-relations)

### 9.1 Select Only Specific Fields

```typescript
// ── Return only id and email — no name ──────────────────────────
const users = await prisma.user.findMany({
  select: {
    id:    true,
    email: true,
    // name is excluded
  },
});
console.log(users);
// [ { id: 1, email: 'alice@prisma.io' }, ... ]
```

---

### 9.2 Select with Nested Relation Fields

```typescript
// ── Select user email + only post titles ────────────────────────
const users = await prisma.user.findMany({
  select: {
    email: true,
    posts: {
      select: {
        title:     true,
        published: true,
      },
    },
  },
});
// [ { email: 'alice@prisma.io', posts: [ { title: '...', published: true } ] } ]
```

---

### 9.3 `select` with `_count`

```typescript
// ── Return each user's email + how many posts they have ──────────
const users = await prisma.user.findMany({
  select: {
    email:  true,
    _count: {
      select: { posts: true },
    },
  },
});
console.log(users);
// [ { email: 'alice@prisma.io', _count: { posts: 4 } }, ... ]
```

---

## 10. Relations — `include`

> 📚 **Docs:** [Relation Queries](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries) · [Nested Filtering & Sorting](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#filter-a-list-of-relations)

### 10.1 Include One Level Deep

```typescript
// ── All Users with their Posts ───────────────────────────────────
const users = await prisma.user.findMany({
  include: { posts: true },
});

// ── A Post with its Author ───────────────────────────────────────
const post = await prisma.post.findUnique({
  where:   { id: 1 },
  include: { author: true },
});
```

---

### 10.2 Filter & Sort Inside `include`

```typescript
// ── Get users and only their PUBLISHED posts, newest first ────────
const users = await prisma.user.findMany({
  include: {
    posts: {
      where:   { published: true },
      orderBy: { id: "desc" },
      take:    3,               // ← max 3 posts per user
    },
  },
});
```

---

### 10.3 Nested `include` (Two Levels Deep)

```typescript
// ── Post → Author → Author's other Posts ────────────────────────
const post = await prisma.post.findUnique({
  where:   { id: 1 },
  include: {
    author: {
      include: {
        posts: true,   // ← author's ALL posts
      },
    },
  },
});
```

---

## 11. Nested Writes

> 📚 **Docs:** [Nested Writes Overview](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#nested-writes) · [connect & disconnect](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#connect-an-existing-record) · [connectOrCreate](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#connect-or-create-a-record)

### 11.1 `create` Inside `create` (Create User + Posts Together)

```typescript
// ── Create User + one Post ───────────────────────────────────────
const user = await prisma.user.create({
  data: {
    name:  "Eve",
    email: "eve@prisma.io",
    posts: {
      create: {
        title:     "Eve's First Post",
        content:   "Hello!",
        published: true,
      },
    },
  },
  include: { posts: true },
});
```

```typescript
// ── Create User + MULTIPLE Posts ─────────────────────────────────
const user = await prisma.user.create({
  data: {
    name:  "Frank",
    email: "frank@prisma.io",
    posts: {
      createMany: {
        data: [
          { title: "Post One",   published: true  },
          { title: "Post Two",   published: false },
          { title: "Post Three", published: true  },
        ],
      },
    },
  },
  include: { posts: true },
});
```

---

### 11.2 `connect` — Link Existing Records

```typescript
// ── Reassign a Post to a different existing User ─────────────────
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    author: {
      connect: { id: 2 },  // ← connect to User id: 2
    },
  },
});
```

---

### 11.3 `disconnect` — Remove a Relation Link

```typescript
// ── Only works if the relation is optional ───────────────────────
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    // If profile were optional:
    // profile: { disconnect: true }
  },
});
```

---

### 11.4 `connectOrCreate` — Connect if Exists, Create if Not

```typescript
const post = await prisma.post.create({
  data: {
    title:     "New Post",
    published: false,
    author: {
      connectOrCreate: {
        where:  { email: "newuser@prisma.io" },  // ← look for this user
        create: { email: "newuser@prisma.io", name: "New User" }, // ← create if missing
      },
    },
  },
});
```

---

### 11.5 Nested `update` / `delete` Inside a Write

```typescript
// ── Update a User AND update one of their Posts at the same time ─
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    name:  "Alice Renamed",
    posts: {
      update: {
        where: { id: 1 },
        data:  { published: false },
      },
    },
  },
  include: { posts: true },
});
```

```typescript
// ── Delete a specific Post while updating the User ────────────────
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      delete: { id: 3 },   // ← delete Post id: 3
    },
  },
  include: { posts: true },
});
```

---

## 12. Transactions — `$transaction`

> 📚 **Docs:** [Prisma Transactions Guide](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) · [Sequential Operations](https://www.prisma.io/docs/orm/prisma-client/queries/transactions#sequential-operations) · [Interactive Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions)

### 12.1 Sequential Batch (Independent Queries)

```typescript
// ── Both must succeed — if either fails, BOTH are rolled back ────
const [newUser, newPost] = await prisma.$transaction([
  prisma.user.create({
    data: { email: "batch@prisma.io", name: "Batch User" },
  }),
  prisma.post.create({
    data: { title: "Batch Post", authorId: 1 },
  }),
]);

console.log(newUser);
console.log(newPost);
```

---

### 12.2 Interactive Transaction (Dependent Queries)

Use when Query 2 **depends on the result** of Query 1.

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Step 1 — Create the User
  const user = await tx.user.create({
    data: { email: "inter@prisma.io", name: "Inter User" },
  });

  // Step 2 — Create a Post using the NEW user's id
  const post = await tx.post.create({
    data: {
      title:    "Inter User's Post",
      authorId: user.id,   // ← depends on Step 1 result
    },
  });

  // Step 3 — Verify the post was created
  const count = await tx.post.count({
    where: { authorId: user.id },
  });

  return { user, post, count };
});

console.log(result.user);
console.log(result.post);
console.log("Post count:", result.count);
```

> ⚠️ **Inside a transaction, use `tx` (not `prisma`) for all queries.**  
> If any step throws, the entire transaction is automatically rolled back.

---

## 13. Raw Queries — `$queryRaw` & `$executeRaw`

> 📚 **Docs:** [Raw Database Access](https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access) · [$queryRaw](https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access#queryraw) · [$executeRaw](https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access#executeraw)

Use raw SQL when Prisma's API can't express a query you need.

### 13.1 `$queryRaw` — Run SQL & Return Results

```typescript
// ── Run raw SQL to get all users ────────────────────────────────
const users = await prisma.$queryRaw`
  SELECT id, email, name FROM users
`;
console.log(users);

// ── Parameterized query (safe from SQL injection) ────────────────
const userId = 1;
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`;
console.log(user);
```

---

### 13.2 `$executeRaw` — Run SQL Without Returning Results

```typescript
// ── Execute raw SQL (returns number of affected rows) ────────────
const count = await prisma.$executeRaw`
  UPDATE posts SET published = true WHERE "authorId" = 1
`;
console.log(`${count} rows updated`);
```

> ⚠️ **Always use template literals** (`` ` `` backticks) with `$queryRaw` and `$executeRaw`  
> so Prisma can safely parameterize values and prevent SQL injection.

---

## 14. Quick Reference Card

```
─── CREATE ────────────────────────────────────────────────────────────
prisma.model.create({ data })                  → create 1 record
prisma.model.createMany({ data, skipDuplicates }) → create many (returns count)
prisma.model.createManyAndReturn({ data })     → create many + return rows

─── READ ──────────────────────────────────────────────────────────────
prisma.model.findUnique({ where })             → 1 by unique field | null
prisma.model.findUniqueOrThrow({ where })      → 1 by unique field | throws
prisma.model.findFirst({ where })              → first match | null
prisma.model.findFirstOrThrow({ where })       → first match | throws
prisma.model.findMany({ where })               → all matching records
prisma.model.count({ where })                  → number of matching records
prisma.model.aggregate({ _count, _min, _max }) → aggregated stats
prisma.model.groupBy({ by, _count })           → grouped + aggregated

─── UPDATE ────────────────────────────────────────────────────────────
prisma.model.update({ where, data })           → update 1 record | throws if missing
prisma.model.updateMany({ where, data })       → update many (returns count)
prisma.model.updateManyAndReturn({ where, data }) → update many + return rows
prisma.model.upsert({ where, update, create }) → update if found, create if not

─── DELETE ────────────────────────────────────────────────────────────
prisma.model.delete({ where })                 → delete 1 record | throws if missing
prisma.model.deleteMany({ where })             → delete many (returns count)

─── QUERY OPTIONS ─────────────────────────────────────────────────────
where:   { ... }                → filter records
orderBy: { field: "asc|desc" }  → sort records
skip:    N                       → skip N records  (offset pagination)
take:    N                       → take N records
cursor:  { id: N }               → cursor for efficient pagination
select:  { field: true }         → only return specified fields
include: { model: true }         → include related records

─── WHERE OPERATORS ───────────────────────────────────────────────────
{ field: "value" }               → exact match
{ field: { equals: "x" }}        → exact match (explicit)
{ field: { not: "x" }}           → not equal
{ field: { contains: "x" }}      → LIKE %x%
{ field: { startsWith: "x" }}    → LIKE x%
{ field: { endsWith: "x" }}      → LIKE %x
{ field: { gt: N }}              → > N
{ field: { gte: N }}             → >= N
{ field: { lt: N }}              → < N
{ field: { lte: N }}             → <= N
{ field: { in: [1,2,3] }}        → IN (1,2,3)
{ field: { notIn: [1,2,3] }}     → NOT IN (1,2,3)
{ field: null }                  → IS NULL
{ field: { not: null }}          → IS NOT NULL
{ AND: [...] }                   → ALL conditions match
{ OR:  [...] }                   → ANY condition matches
{ NOT: {...} }                   → condition does NOT match
{ relation: { some: {...} }}     → at least one related record matches
{ relation: { every: {...} }}    → ALL related records match
{ relation: { none: {...} }}     → NO related records match
{ relation: { is: {...} }}       → related record matches
{ relation: { isNot: {...} }}    → related record does NOT match

─── NESTED WRITE OPERATIONS ───────────────────────────────────────────
{ relation: { create: {...} }}          → create new related record
{ relation: { createMany: { data:[] }}} → create many related records
{ relation: { connect: { id: N } }}     → link to existing record
{ relation: { connectOrCreate: {...} }} → link or create
{ relation: { update: { where, data }}} → update related record
{ relation: { delete: { id: N } }}      → delete related record
{ relation: { disconnect: true }}       → remove relation link (optional only)

─── TRANSACTIONS ──────────────────────────────────────────────────────
prisma.$transaction([q1, q2, q3])          → batch (all or nothing)
prisma.$transaction(async (tx) => { ... }) → interactive (use tx inside)

─── RAW SQL ───────────────────────────────────────────────────────────
prisma.$queryRaw`SELECT ...`               → run SQL, returns rows
prisma.$executeRaw`UPDATE ...`             → run SQL, returns affected count
```

---
 
## 15. Official Reference Links
 
| Query Topic | Official Prisma Documentation URL |
|---|---|
| **Prisma Client Concepts & Overview** | https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction |
| **Model Queries (CRUD Operations)** | https://www.prisma.io/docs/orm/prisma-client/queries/crud |
| **`create` & `createMany`** | https://www.prisma.io/docs/orm/prisma-client/queries/crud#create |
| **`findUnique` & `findUniqueOrThrow`** | https://www.prisma.io/docs/orm/prisma-client/queries/crud#get-record-by-compound-id-or-compound-unique-identifier |
| **`findFirst` & `findFirstOrThrow`** | https://www.prisma.io/docs/orm/prisma-client/queries/crud#get-the-first-record-that-matches-a-specific-criteria |
| **`findMany`** | https://www.prisma.io/docs/orm/prisma-client/queries/crud#get-all-records |
| **`update` & `updateMany`** | https://www.prisma.io/docs/orm/prisma-client/queries/crud#update |
| **`upsert`** | https://www.prisma.io/docs/orm/prisma-client/queries/crud#upsert |
| **`delete` & `deleteMany`** | https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete |
| **Filtering & `where` Conditions** | https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting |
| **Case-insensitive Filtering (`mode`)** | https://www.prisma.io/docs/orm/prisma-client/queries/case-sensitivity |
| **Relation Filters (`some`, `every`, `none`)** | https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#filter-on-relations-to-a-relation-list |
| **Sorting (`orderBy`)** | https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#sort-records |
| **Pagination (`skip`, `take`, `cursor`)** | https://www.prisma.io/docs/orm/prisma-client/queries/pagination |
| **Field Selection (`select`)** | https://www.prisma.io/docs/orm/prisma-client/queries/select-fields |
| **Relation Queries (`include`)** | https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries |
| **Nested Writes (`connect`, `create`, `disconnect`)** | https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#nested-writes |
| **Aggregation, Grouping & Counting (`count`, `aggregate`, `groupBy`)** | https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing |
| **Transactions & Concurrency (`$transaction`)** | https://www.prisma.io/docs/orm/prisma-client/queries/transactions |
| **Interactive Transactions** | https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions |
| **Raw Database Access (`$queryRaw`, `$executeRaw`)** | https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access |
| **Working with Prisma Client in TypeScript** | https://www.prisma.io/docs/orm/prisma-client/type-safety |
| **Full Prisma Client API Reference** | https://www.prisma.io/docs/orm/reference/prisma-client-reference |
