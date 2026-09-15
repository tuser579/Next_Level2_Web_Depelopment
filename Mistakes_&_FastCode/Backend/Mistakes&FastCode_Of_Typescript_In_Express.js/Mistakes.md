# ⚠️ Common TypeScript Mistakes in Express.js Projects

> Step-by-step guide for software engineers — each mistake explained with **bad code** and **better code**.

---

## 📋 Table of Contents

1. [Using `any` Type Everywhere](#1-using-any-type-everywhere)
2. [Not Typing Request Body, Params & Query](#2-not-typing-request-body-params--query)
3. [Missing Error Handling Middleware](#3-missing-error-handling-middleware)
4. [Not Using Async/Await Properly in Route Handlers](#4-not-using-asyncawait-properly-in-route-handlers)
5. [Not Validating Environment Variables](#5-not-validating-environment-variables)
6. [Mixing Business Logic Inside Route Handlers](#6-mixing-business-logic-inside-route-handlers)
7. [Not Using Prisma Generated Types Correctly](#7-not-using-prisma-generated-types-correctly)
8. [Ignoring Null / Undefined Checks](#8-ignoring-null--undefined-checks)
9. [Using `require()` Instead of ES Module Imports](#9-using-require-instead-of-es-module-imports)
10. [Not Using Interfaces / Types for API Responses](#10-not-using-interfaces--types-for-api-responses)
11. [Using `console.log` for Production Logging](#11-using-consolelog-for-production-logging)
12. [Not Handling Promise Rejections Globally](#12-not-handling-promise-rejections-globally)

---

## 1. Using `any` Type Everywhere

### ❌ Bad Code

```ts
// You lose ALL TypeScript benefits — no autocomplete, no error catching
app.get('/user', (req: any, res: any) => {
  const user: any = getUserFromDB();
  res.send(user.nmae); // typo — TypeScript won't catch this!
});
```

**Why it's bad:**
- `any` disables type checking completely.
- Typos and wrong property access go undetected.
- Defeats the entire purpose of using TypeScript.

### ✅ Better Code

```ts
import { Request, Response } from 'express';

interface User {
  name: string;
  email: string;
}

app.get('/user', (req: Request, res: Response) => {
  const user: User = getUserFromDB();
  res.send(user.name); // TypeScript will warn if you type 'nmae'
});
```

**Why it's better:**
- TypeScript catches typos at compile time.
- Autocomplete works perfectly in your editor.

---

## 2. Not Typing Request Body, Params & Query

### ❌ Bad Code

```ts
app.post('/login', (req, res) => {
  const email = req.body.email;     // type is 'any'
  const password = req.body.pasword; // typo — nobody knows!
});
```

**Why it's bad:**
- `req.body`, `req.params`, `req.query` are all `any` by default.
- A typo in property names won't cause any compile-time error.

### ✅ Better Code

```ts
import { Request, Response } from 'express';

interface LoginBody {
  email: string;
  password: string;
}

interface UserParams {
  id: string;
}

// Generic typing for Request: Request<Params, ResBody, ReqBody, Query>
app.post('/login', (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body; // fully typed!
});

app.get('/user/:id', (req: Request<UserParams>, res: Response) => {
  const { id } = req.params; // id is typed as string
});
```

**Why it's better:**
- Full type safety on body, params, and query.
- Typos on property names are caught at compile time.

---

## 3. Missing Error Handling Middleware

### ❌ Bad Code

```ts
app.get('/data', async (req, res) => {
  const data = await fetchData(); // what if this throws?
  res.json(data);
});

// No error handler — Express sends a raw HTML error page on crash
```

**Why it's bad:**
- If `fetchData()` throws, Express sends an ugly HTML error to the client.
- No consistent error response format.
- App might crash entirely.

### ✅ Better Code

```ts
import { Request, Response, NextFunction } from 'express';

// Step 1: Wrap async route handlers to forward errors
const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Step 2: Use in your route
app.get('/data', asyncHandler(async (req: Request, res: Response) => {
  const data = await fetchData();
  res.json(data);
}));

// Step 3: Global error middleware — MUST be at the END of all routes
interface AppError extends Error {
  statusCode?: number;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});
```

**Why it's better:**
- All async errors flow to one centralized handler.
- Client always gets a consistent JSON error response.

---

## 4. Not Using Async/Await Properly in Route Handlers

### ❌ Bad Code

```ts
import { prisma } from './prisma';

app.get('/users', (req, res) => {
  prisma.user.findMany()
    .then(users => res.json(users))
    .catch(err => console.log(err)); // error logged but NO response sent!
});
```

**Why it's bad:**
- On error, the client waits forever — no response is sent.
- `.catch(err => console.log(err))` swallows the error silently.

### ✅ Better Code

```ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

app.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    next(error); // passes to global error handler — client gets a response
  }
});
```

**Why it's better:**
- `next(error)` triggers your global error middleware.
- The client always receives a proper response.

---

## 5. Not Validating Environment Variables

### ❌ Bad Code

```ts
// Prisma reads DATABASE_URL automatically — but what if it's missing?
const PORT = process.env.PORT;          // could be undefined!
const DATABASE_URL = process.env.DATABASE_URL; // Prisma needs this — undefined = crash!

// .env file missing → PrismaClient throws a cryptic connection error at runtime
app.listen(PORT);
```

**Why it's bad:**
- If `DATABASE_URL` is missing from `.env`, Prisma throws a confusing error deep in your code.
- Hard to debug in production — error appears far from the source.
- `PORT` being `undefined` means the server listens on the wrong port silently.

### ✅ Better Code

```ts
// config/env.ts
const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  PORT: Number(getEnv('PORT')),
  DATABASE_URL: getEnv('DATABASE_URL'), // validated before Prisma even connects
  JWT_SECRET: getEnv('JWT_SECRET'),
};

// server.ts
import { config } from './config/env';
// Prisma picks up DATABASE_URL from process.env automatically
// but we validate it exists FIRST — so errors are clear and immediate
app.listen(config.PORT);
```

**`.env` example for Prisma + PostgreSQL:**

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
JWT_SECRET=your_super_secret_key
```

**Why it's better:**
- App crashes immediately at startup with a clear message if a variable is missing.
- Fail-fast principle: fix problems before they become production bugs.

---

## 6. Mixing Business Logic Inside Route Handlers

### ❌ Bad Code

```ts
import { prisma } from './prisma';

app.post('/register', async (req, res) => {
  // Validation
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Fields required' });
  }
  // Hashing
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  // DB — Prisma insert directly in the route!
  const user = await prisma.user.create({
    data: { email: req.body.email, password: hashedPassword },
  });
  // Email
  await sendWelcomeEmail(user.email);

  res.status(201).json(user);
});
```

**Why it's bad:**
- Route handler does too many things (validate, hash, DB, email).
- Prisma calls scattered across routes — impossible to reuse or test.
- Impossible to unit test each piece independently.

### ✅ Better Code

```ts
// services/user.service.ts
import { prisma } from '../prisma';

export const registerUser = async (email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  // All Prisma logic lives in the service layer
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });
  await sendWelcomeEmail(user.email);
  return user;
};

// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { registerUser } from '../services/user.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await registerUser(email, password);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// routes/user.route.ts
router.post('/register', register);
```

**Why it's better:**
- Clean separation: Route → Controller → Service.
- All Prisma queries live in services — easy to mock and test.

---

## 7. Not Using Prisma Generated Types Correctly

### ❌ Bad Code

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Using 'any' instead of Prisma's generated types
const createUser = async (data: any) => {   // ❌ any — loses all type safety
  return await prisma.user.create({ data });
};

const user = await createUser({ email: 'a@b.com', pasword: 'secret' }); // typo — not caught!
console.log(user.nmae); // typo — not caught!
```

**Why it's bad:**
- Prisma auto-generates fully typed models from your `schema.prisma` — using `any` throws all that away.
- Typos in field names and input data go undetected.
- You lose autocomplete on query results.

### ✅ Better Code

**Step 1 — Define your Prisma schema (`prisma/schema.prisma`):**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  age       Int
  createdAt DateTime @default(now())
}
```

**Step 2 — Run `npx prisma generate` to generate types, then use them:**

```ts
import { PrismaClient, User, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Use Prisma.UserCreateInput for insert data — fully typed!
const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  return await prisma.user.create({ data });
};

// Use Prisma.UserWhereUniqueInput for lookups
const getUserById = async (id: number): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

// Usage — TypeScript catches every mistake
const user = await createUser({ name: 'Alice', email: 'a@b.com', age: 25 });
console.log(user.name);  // ✅ correct — fully typed
console.log(user.nmae);  // ❌ TypeScript error — typo caught at compile time!
```

**Why it's better:**
- Prisma generates types directly from your PostgreSQL schema — always in sync.
- `Prisma.UserCreateInput`, `Prisma.UserUpdateInput`, `User` etc. give you full autocomplete.
- Typos in field names are caught at compile time, not in production.

---

## 8. Ignoring Null / Undefined Checks

### ❌ Bad Code

```ts
import { prisma } from './prisma';

app.get('/user/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  res.json(user.name); // crashes if user is null! Prisma returns null when not found
});
```

**Why it's bad:**
- `findUnique` returns `null` when no row is found in PostgreSQL.
- Accessing `.name` on `null` throws a runtime `TypeError`.
- Server responds with 500 instead of a clean 404.

### ✅ Better Code

```ts
import { prisma } from './prisma';

app.get('/user/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    // Always validate the parsed value too
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });

    // Prisma returns null when no row matches — always check!
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});
```

**Why it's better:**
- `findUnique` always returns `User | null` — TypeScript forces you to handle both cases.
- Proper 404 response instead of a 500 crash.
- Also validates the `id` param is a real number before querying PostgreSQL.

---

## 9. Using `require()` Instead of ES Module Imports

### ❌ Bad Code

```ts
// TypeScript file but still using CommonJS require
const express = require('express');
const { PrismaClient } = require('@prisma/client'); // returns 'any' — no type info!

const prisma = new PrismaClient();
const app = express(); // app is typed as 'any' — no help from TypeScript
```

**Why it's bad:**
- `require()` returns `any` — Prisma's generated types are completely lost.
- No autocomplete on `prisma.user`, `prisma.product`, etc.
- All TypeScript benefits for the module are lost.

### ✅ Better Code

```ts
// lib/prisma.ts — singleton Prisma client (best practice)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// server.ts
import express, { Application } from 'express';
import { prisma } from './lib/prisma';

const app: Application = express(); // fully typed!
// prisma.user.findMany() → full autocomplete and type safety ✅
```

**Update `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

**Why it's better:**
- Full type information from Prisma's generated client and `@types/express`.
- Singleton pattern prevents opening too many PostgreSQL connections.
- Modern, consistent TypeScript-style imports.

---

## 10. Not Using Interfaces / Types for API Responses

### ❌ Bad Code

```ts
import { prisma } from './prisma';

app.get('/product/:id', async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  res.json(product); // sends the raw Prisma object — exposes ALL DB columns!
});
```

**Why it's bad:**
- Raw Prisma objects expose ALL columns from PostgreSQL, including internal fields like `createdAt`, `updatedAt`, `deletedAt`, hashed passwords, etc.
- No control over the API contract.
- DB schema changes (adding a column) accidentally leak to the client.

### ✅ Better Code

```ts
// types/api.types.ts
interface ProductResponse {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// controller
import { prisma } from './prisma';

app.get('/product/:id', async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ProductResponse>>,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    // Use Prisma's 'select' to only fetch needed columns from PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, price: true, category: true }, // ✅ only what we need
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Explicitly shape the response — type-safe
    const response: ProductResponse = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});
```

**Why it's better:**
- `select` in Prisma limits which PostgreSQL columns are fetched — faster query and no data leaks.
- Stable API contract — adding DB columns never accidentally exposes them to the client.

---

## 11. Using `console.log` for Production Logging

### ❌ Bad Code

```ts
app.post('/payment', async (req, res) => {
  console.log('Payment received', req.body); // sensitive data in plain logs!
  try {
    const result = await processPayment(req.body);
    console.log('Success', result);
    res.json(result);
  } catch (err) {
    console.log('Failed', err);
    res.status(500).json({ message: 'Failed' });
  }
});
```

**Why it's bad:**
- `console.log` has no log levels (info, warn, error).
- No timestamps — impossible to trace when something happened.
- Sensitive data like card numbers could be accidentally logged.

### ✅ Better Code

```ts
// Install: npm install winston
// logger/index.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// In route
import { logger } from '../logger';

app.post('/payment', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Payment request received', { userId: req.body.userId });
  try {
    const result = await processPayment(req.body);
    logger.info('Payment successful', { orderId: result.orderId });
    res.json(result);
  } catch (err) {
    logger.error('Payment failed', { error: (err as Error).message });
    next(err);
  }
});
```

**Why it's better:**
- Structured logs with timestamps and severity levels.
- Logs saved to files — searchable in production.
- Only necessary non-sensitive data is logged.

---

## 12. Not Handling Promise Rejections Globally

### ❌ Bad Code

```ts
// server.ts — nothing catches unhandled promise rejections
app.listen(3000, () => {
  console.log('Server running');
});
```

**Why it's bad:**
- Unhandled `Promise.reject()` crashes Node.js in newer versions.
- Silent failures that are nearly impossible to debug in production.

### ✅ Better Code

```ts
import { logger } from './logger';

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection:', { reason });
  server.close(() => {
    process.exit(1); // graceful shutdown
  });
});

// Catch uncaught synchronous exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { message: error.message });
  process.exit(1);
});
```

**Why it's better:**
- Any unhandled error is logged before the process exits.
- Graceful shutdown closes the server cleanly before exiting.
- You always know exactly what crashed and why.

---

## 🏁 Quick Reference Summary

| # | Mistake | Fix |
|---|---------|-----|
| 1 | Using `any` everywhere | Define interfaces/types for everything |
| 2 | Untyped `req.body` / `req.params` | Use `Request<Params, Res, Body, Query>` generics |
| 3 | No error handling middleware | Add global `(err, req, res, next)` middleware |
| 4 | Swallowed async errors | Use `try/catch` + `next(error)` |
| 5 | Unvalidated env variables | Validate all env vars at startup with a helper |
| 6 | Fat route handlers | Separate into Controller → Service layers |
| 7 | Ignoring Prisma generated types | Use `Prisma.UserCreateInput`, `User`, `Prisma.UserWhereUniqueInput` |
| 8 | No null/undefined checks | Always check DB result before accessing properties |
| 9 | `require()` in TypeScript | Use `import` with `esModuleInterop: true` |
| 10 | Sending raw DB documents | Shape response with explicit interfaces |
| 11 | `console.log` in production | Use `winston` or `pino` logger |
| 12 | No global error catching | Handle `unhandledRejection` & `uncaughtException` |

---

> 💡 **Rule of thumb**: If TypeScript is not helping you catch bugs, you are probably not using it correctly. Every `any` is a missed opportunity.
