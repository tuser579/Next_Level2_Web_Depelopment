# 🗃️ Prisma Generated Code — Usable Types & Enums Guide

> **Module 23 Reference** | Prisma Press Backend
>
> Generated folder: `generated/prisma/`
>
> ⚠️ **Never edit files inside `generated/`** — they are auto-created by `prisma generate`. Always import from them, never modify.

---

## 📌 What is the `generated/` Folder?

When you run `prisma generate`, Prisma reads your `prisma/schema/` files and **auto-creates TypeScript types, enums, and classes** inside `generated/prisma/`.

These files give you:
- **Model types** (what a `User`, `Post`, etc. looks like in code)
- **Enums** (`Role`, `PostStatus`, `CommentStatus`, `ActiveStatus`)
- **The `Prisma` namespace** (error classes like `PrismaClientKnownRequestError`)
- **The `PrismaClient` class** (your database connection)

---

## 📌 Generated File Map

```
generated/
└── prisma/
    ├── client.ts          ← Main entry: PrismaClient, model types, Prisma namespace
    ├── enums.ts           ← All enums: Role, PostStatus, CommentStatus, ActiveStatus
    ├── models.ts          ← Barrel export of all model types
    └── models/
        ├── User.ts        ← User type + all User-related input/output types
        ├── Post.ts        ← Post type + all Post-related input/output types
        ├── Comment.ts     ← Comment type + all Comment-related input/output types
        └── Profile.ts     ← Profile type + all Profile-related input/output types
```

---

## 📌 Part 1 — Enums

**File:** `generated/prisma/enums.ts`

Enums are fixed sets of allowed values. They are used as field types in your models.

### Import

```typescript
import { Role, ActiveStatus, PostStatus, CommentStatus } from "../../generated/prisma/enums";
// OR from client (both work):
import { Role, ActiveStatus, PostStatus, CommentStatus } from "../../generated/prisma/client";
```

---

### 🔷 `Role` Enum

Used for **User roles** — controls what a user is allowed to do.

```typescript
export const Role = {
  USER:   'USER',
  AUTHOR: 'AUTHOR',
  ADMIN:  'ADMIN'
} as const

export type Role = 'USER' | 'AUTHOR' | 'ADMIN'
```

**Schema definition (`user.prisma`):**
```prisma
role Role @default(USER)
```

**✅ Real Usage Examples:**

```typescript
// 1. In auth middleware — checking required roles
import { Role } from "../../generated/prisma/enums";

auth(Role.ADMIN)         // Only ADMIN can access
auth(Role.ADMIN, Role.AUTHOR)  // ADMIN or AUTHOR can access
auth(Role.USER, Role.ADMIN)    // USER or ADMIN can access

// 2. As TypeScript type in interfaces
interface IUser {
    id: string;
    name: string;
    email: string;
    role: Role;   // ← type-safe, only "USER" | "AUTHOR" | "ADMIN" allowed
}

// 3. In Prisma queries — filtering by role
const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN }
});

// 4. As a function parameter type
const checkRole = (role: Role) => {
    if (role === Role.ADMIN) {
        console.log("This is an admin");
    }
};
```

---

### 🔷 `ActiveStatus` Enum

Used for **User account status** — whether the user is active or blocked.

```typescript
export const ActiveStatus = {
  ACTIVE:  'ACTIVE',
  BLOCKED: 'BLOCKED'
} as const

export type ActiveStatus = 'ACTIVE' | 'BLOCKED'
```

**Schema definition (`user.prisma`):**
```prisma
activeStatus ActiveStatus @default(ACTIVE)
```

**✅ Real Usage Examples:**

```typescript
import { ActiveStatus } from "../../generated/prisma/enums";

// 1. In auth middleware — block check
if (user.activeStatus === ActiveStatus.BLOCKED) {
    throw new Error("User is blocked. Please contact the admin.");
}

// 2. In Prisma query — find only active users
const activeUsers = await prisma.user.findMany({
    where: { activeStatus: ActiveStatus.ACTIVE }
});

// 3. Update user status to blocked (admin action)
await prisma.user.update({
    where: { id: userId },
    data: { activeStatus: ActiveStatus.BLOCKED }
});
```

---

### 🔷 `PostStatus` Enum

Used for **Post visibility** — whether a post is a draft, published, or archived.

```typescript
export const PostStatus = {
  DRAFT:     'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED:  'ARCHIVED'
} as const

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
```

**Schema definition (`post.prisma`):**
```prisma
status PostStatus @default(PUBLISHED)
```

**✅ Real Usage Examples:**

```typescript
import { PostStatus } from "../../generated/prisma/enums";

// 1. Find only published posts (for public feed)
const publishedPosts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED }
});

// 2. Find drafts for a specific author
const myDrafts = await prisma.post.findMany({
    where: {
        authorId: userId,
        status: PostStatus.DRAFT
    }
});

// 3. Archive a post
await prisma.post.update({
    where: { id: postId },
    data: { status: PostStatus.ARCHIVED }
});

// 4. In interface as type
interface ICreatePostPayload {
    title: string;
    content: string;
    status?: PostStatus;   // optional — defaults to PUBLISHED in schema
}
```

---

### 🔷 `CommentStatus` Enum

Used for **Comment moderation** — whether a comment is approved or rejected.

```typescript
export const CommentStatus = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const

export type CommentStatus = 'APPROVED' | 'REJECTED'
```

**Schema definition (`comment.prisma`):**
```prisma
status CommentStatus @default(APPROVED)
```

**✅ Real Usage Examples:**

```typescript
import { CommentStatus } from "../../generated/prisma/enums";

// 1. In moderateComment service function
const moderateComment = async (commentId: string, status: CommentStatus) => {
    const result = await prisma.comment.update({
        where: { id: commentId },
        data: { status }   // status = "APPROVED" or "REJECTED"
    });
    return result;
};

// 2. In controller — reading status from request body
const status = req.body.status as CommentStatus;
await commentService.moderateComment(commentId, status);

// 3. Find only approved comments for display
const approvedComments = await prisma.comment.findMany({
    where: { status: CommentStatus.APPROVED }
});
```

---

## 📌 Part 2 — Model Types

**File:** `generated/prisma/client.ts` (re-exports from `models/`)

Model types represent the **shape of a row from the database**.

### Import

```typescript
import { User, Post, Comment, Profile } from "../../generated/prisma/client";
```

---

### 🔷 `User` Type

Represents a full user row from the database.

```typescript
// What the User type looks like (from User.ts model file):
type User = {
    id:           string;
    name:         string;
    email:        string;
    password:     string;
    activeStatus: ActiveStatus;   // "ACTIVE" | "BLOCKED"
    role:         Role;           // "USER" | "AUTHOR" | "ADMIN"
    createdAt:    Date;
    updatedAt:    Date;
}
```

**✅ Real Usage Examples:**

```typescript
import { User } from "../../generated/prisma/client";

// 1. As return type of a service function
const getUserById = async (id: string): Promise<User> => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    return user;
};

// 2. Using Prisma's Omit utility — exclude password from response
import { Prisma } from "../../generated/prisma/client";

type UserWithoutPassword = Omit<User, "password">;

// 3. In the auth middleware — req.user type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id:    string;
                name:  string;
                email: string;
                role:  Role;
            }
        }
    }
}

// 4. As variable type
const user: User | null = await prisma.user.findUnique({
    where: { email }
});
```

---

### 🔷 `Post` Type

Represents a full post row from the database.

```typescript
// What the Post type looks like:
type Post = {
    id:         string;
    title:      string;
    content:    string;
    thumbnail:  string | null;    // optional
    isFeatured: boolean;
    status:     PostStatus;       // "DRAFT" | "PUBLISHED" | "ARCHIVED"
    tags:       string[];         // array of strings
    views:      number;
    createdAt:  Date;
    updatedAt:  Date;
    authorId:   string;           // foreign key to User
}
```

**✅ Real Usage Examples:**

```typescript
import { Post } from "../../generated/prisma/client";

// 1. Return type with author included (relation)
import { Prisma } from "../../generated/prisma/client";

type PostWithAuthor = Prisma.PostGetPayload<{
    include: { author: true }
}>;

// 2. As return type
const getPostById = async (id: string): Promise<Post> => {
    return await prisma.post.findUniqueOrThrow({ where: { id } });
};

// 3. In interface using partial types
interface IUpdatePostPayload {
    title?:      string;
    content?:    string;
    thumbnail?:  string;
    status?:     PostStatus;
    tags?:       string[];
    isFeatured?: boolean;
}
```

---

### 🔷 `Comment` Type

Represents a full comment row from the database.

```typescript
// What the Comment type looks like:
type Comment = {
    id:        string;
    content:   string;
    authorId:  string;          // foreign key to User
    postId:    string;          // foreign key to Post
    status:    CommentStatus;   // "APPROVED" | "REJECTED"
    createdAt: Date;
    updatedAt: Date;
}
```

**✅ Real Usage Examples:**

```typescript
import { Comment } from "../../generated/prisma/client";

// 1. As return type with related data
import { Prisma } from "../../generated/prisma/client";

type CommentWithRelations = Prisma.CommentGetPayload<{
    include: {
        author: true;
        post: true;
    }
}>;

// 2. As return type of service function
const createComment = async (payload, userId: string): Promise<Comment> => {
    return await prisma.comment.create({
        data: { ...payload, authorId: userId }
    });
};
```

---

### 🔷 `Profile` Type

Represents a user's profile (one-to-one with User).

```typescript
// What the Profile type looks like:
type Profile = {
    id:           string;
    profilePhoto: string | null;   // optional
    bio:          string | null;   // optional
    userId:       string;          // foreign key to User (unique)
}
```

**✅ Real Usage Examples:**

```typescript
import { Profile } from "../../generated/prisma/client";

// 1. Create or update profile (upsert)
const upsertProfile = async (userId: string, data: Partial<Profile>) => {
    return await prisma.profile.upsert({
        where: { userId },
        update: data,
        create: { ...data, userId }
    });
};

// 2. Include profile when fetching user
const userWithProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
});
```

---

## 📌 Part 3 — The `Prisma` Namespace

**File:** `generated/prisma/client.ts` → re-exports from `internal/prismaNamespace`

The `Prisma` namespace contains **error classes** and **advanced utility types**.

### Import

```typescript
import { Prisma } from "../../generated/prisma/client";
```

---

### 🔷 Prisma Error Classes

Used in `globalErrorHandler.ts` to detect exactly what kind of DB error occurred.

#### `Prisma.PrismaClientValidationError`

```typescript
// When: wrong field type or missing required field in a query
if (err instanceof Prisma.PrismaClientValidationError) {
    // Triggered by:
    await prisma.user.create({ data: { email: "test@test.com" } }); // missing name, password
}
```

#### `Prisma.PrismaClientKnownRequestError`

```typescript
// When: DB constraint violated (duplicate key, foreign key, not found, etc.)
if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.log(err.code);   // "P2002", "P2003", "P2025", etc.
    console.log(err.meta);   // extra info about the error
    console.log(err.message); // human-readable message
}
```

**Error code reference used in this project:**

| `err.code` | Meaning |
|------------|---------|
| `"P2002"`  | Unique constraint failed (duplicate email, etc.) |
| `"P2003"`  | Foreign key constraint failed |
| `"P2025"`  | Record to update/delete not found |
| `"P2000"`  | Value too long for field |
| `"P2001"`  | Record does not exist |
| `"P2011"`  | Null constraint violated |

#### `Prisma.PrismaClientInitializationError`

```typescript
// When: Cannot connect to database (wrong URL, server down, wrong credentials)
if (err instanceof Prisma.PrismaClientInitializationError) {
    console.log(err.errorCode);  // "P1000", "P1001", etc.
}
```

#### `Prisma.PrismaClientUnknownRequestError`

```typescript
// When: Unknown DB error (very rare)
if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    // no error code available
}
```

#### `Prisma.PrismaClientRustPanicError`

```typescript
// When: Critical internal Prisma engine crash (extremely rare)
if (err instanceof Prisma.PrismaClientRustPanicError) {
    // means Prisma's internal engine crashed
}
```

---

### 🔷 `Prisma.GetPayload` Utility Types

These let you describe the **exact shape of data returned** when you use `include` or `select`.

**Import:**
```typescript
import { Prisma } from "../../generated/prisma/client";
```

**Pattern:**
```typescript
// Model name + "GetPayload" + { include/select object }
type TypeName = Prisma.UserGetPayload<{ include: { profile: true } }>
```

**✅ Real Usage Examples:**

```typescript
import { Prisma } from "../../generated/prisma/client";

// 1. User with profile included
type UserWithProfile = Prisma.UserGetPayload<{
    include: { profile: true }
}>;
// Result type:
// { id, name, email, role, activeStatus, ..., profile: { id, profilePhoto, bio, userId } }

// 2. User without password (using select)
type UserPublic = Prisma.UserGetPayload<{
    select: {
        id:    true;
        name:  true;
        email: true;
        role:  true;
    }
}>;

// 3. Post with author and comments
type PostFull = Prisma.PostGetPayload<{
    include: {
        author:   true;
        comments: true;
    }
}>;

// 4. Comment with author and post
type CommentWithRelations = Prisma.CommentGetPayload<{
    include: {
        author: true;
        post:   true;
    }
}>;

// Use in service function:
const getPostWithDetails = async (id: string): Promise<PostFull> => {
    return await prisma.post.findUniqueOrThrow({
        where: { id },
        include: { author: true, comments: true }
    });
};
```

---

## 📌 Part 4 — `PrismaClient` Class

**File:** `generated/prisma/client.ts`

The `PrismaClient` is your connection to the database. You use it to run all queries.

### How It's Created in This Project

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
```

### Import and Use in Services

```typescript
// Always import the pre-created instance, never create a new one
import { prisma } from "../../lib/prisma";

// Then use it to run queries:
const users = await prisma.user.findMany();
const post  = await prisma.post.findUnique({ where: { id: "..." } });
```

---

## 📌 Part 5 — Complete Import Cheat Sheet

### From `generated/prisma/enums.ts` (Enums only)

```typescript
import { Role }          from "../../generated/prisma/enums";
import { ActiveStatus }  from "../../generated/prisma/enums";
import { PostStatus }    from "../../generated/prisma/enums";
import { CommentStatus } from "../../generated/prisma/enums";

// Or all at once:
import { Role, ActiveStatus, PostStatus, CommentStatus } from "../../generated/prisma/enums";
```

### From `generated/prisma/client.ts` (Everything)

```typescript
// Model types
import { User, Post, Comment, Profile } from "../../generated/prisma/client";

// Enums (also re-exported from client)
import { Role, ActiveStatus, PostStatus, CommentStatus } from "../../generated/prisma/client";

// Prisma namespace (error classes + utility types)
import { Prisma } from "../../generated/prisma/client";

// PrismaClient class (used only in src/lib/prisma.ts)
import { PrismaClient } from "../../generated/prisma/client";

// Everything at once:
import { User, Post, Comment, Profile, Role, ActiveStatus, PostStatus, CommentStatus, Prisma, PrismaClient } from "../../generated/prisma/client";
```

---

## 📌 Part 6 — Real Files in This Project That Use Generated Code

| File | What it imports from generated/ |
|------|----------------------------------|
| `src/middlewares/auth.ts` | `Role` from `enums` |
| `src/middlewares/globalErrorHandler.ts` | `Prisma` from `client` (error classes) |
| `src/modules/comment/comment.service.ts` | `CommentStatus` from `enums` |
| `src/modules/comment/comment.controller.ts` | `CommentStatus` from `enums` |
| `src/lib/prisma.ts` | `PrismaClient` from `client` |

---

## 📌 Summary Table

| What you need | What to import | From where |
|---|---|---|
| User role values | `Role` | `generated/prisma/enums` |
| User status values | `ActiveStatus` | `generated/prisma/enums` |
| Post status values | `PostStatus` | `generated/prisma/enums` |
| Comment status values | `CommentStatus` | `generated/prisma/enums` |
| User data shape/type | `User` | `generated/prisma/client` |
| Post data shape/type | `Post` | `generated/prisma/client` |
| Comment data shape/type | `Comment` | `generated/prisma/client` |
| Profile data shape/type | `Profile` | `generated/prisma/client` |
| Prisma error classes | `Prisma` | `generated/prisma/client` |
| Relation-aware types | `Prisma.UserGetPayload<...>` etc. | `generated/prisma/client` |
| DB connection instance | `prisma` (pre-created) | `src/lib/prisma` |
