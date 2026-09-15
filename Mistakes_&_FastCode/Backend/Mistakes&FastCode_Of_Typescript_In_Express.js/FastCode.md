# ⚡ Fast Code vs Slow Code — TypeScript + Express.js + Prisma + PostgreSQL

> Serving **1 Million Users** properly — step-by-step slow vs fast code examples with clear explanations.

---

## 📋 Table of Contents

1. [N+1 Query Problem (Fetch All Users + Their Posts)](#1-n1-query-problem)
2. [Loading ALL Data vs Pagination](#2-loading-all-data-vs-pagination)
3. [Sequential vs Parallel Async Operations](#3-sequential-vs-parallel-async-operations)
4. [No Caching vs Redis Caching](#4-no-caching-vs-redis-caching)
5. [No Database Indexing vs Proper Indexing](#5-no-database-indexing-vs-proper-indexing)
6. [Blocking the Event Loop](#6-blocking-the-event-loop)
7. [No Connection Pooling vs Prisma Connection Pool](#7-no-connection-pooling-vs-prisma-connection-pool)
8. [No Response Compression vs Gzip Compression](#8-no-response-compression-vs-gzip-compression)
9. [Fetching All Columns vs Selecting Only Needed Columns](#9-fetching-all-columns-vs-selecting-only-needed-columns)
10. [No Rate Limiting vs Rate Limiting](#10-no-rate-limiting-vs-rate-limiting)
11. [Single Process vs Cluster Mode](#11-single-process-vs-cluster-mode)
12. [Streaming Large Data](#12-streaming-large-data)

---

## 1. N+1 Query Problem

> One of the **most common** performance killers. For 1M users, this can mean millions of extra DB queries.

### 🐌 Slow Code

```ts
// For every user, it fires a SEPARATE SQL query to get their posts
// 100 users = 101 queries! 1000 users = 1001 queries!

app.get('/users-with-posts', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany(); // Query 1

  const result = [];
  for (const user of users) {
    // ❌ Fires one new DB query per user — N+1 Problem!
    const posts = await prisma.post.findMany({
      where: { userId: user.id },
    });
    result.push({ ...user, posts });
  }

  res.json(result);
});
```

**Why it's slow:**
- 1000 users = **1001 SQL queries** hitting PostgreSQL.
- Each query has network round-trip overhead.
- PostgreSQL gets overwhelmed under load.

### ⚡ Fast Code

```ts
// Prisma's 'include' fetches users AND posts in ONE optimized SQL JOIN query

app.get('/users-with-posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true, // ✅ Single JOIN query — no matter how many users!
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast:**
- 1000 users = **1 SQL query** with a JOIN.
- Prisma batches the data efficiently.
- **10x–100x faster** under high load.

---

## 2. Loading ALL Data vs Pagination

> Never load millions of rows at once — your server will run out of memory and crash.

### 🐌 Slow Code

```ts
app.get('/users', async (req: Request, res: Response) => {
  // ❌ Loads ALL users from PostgreSQL into memory at once!
  // 1 Million users = server runs out of RAM and crashes
  const users = await prisma.user.findMany();

  res.json(users);
});
```

**Why it's slow:**
- 1 Million rows loaded into RAM in one shot.
- Response payload could be **GBs of JSON**.
- All other requests are blocked while this runs.

### ⚡ Fast Code

```ts
// Cursor-based pagination — the fastest approach for large datasets

app.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100); // max 100 per page
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const users = await prisma.user.findMany({
      take: limit,
      // Cursor pagination: start after the last seen item
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { id: 'asc' },
      select: { id: true, name: true, email: true }, // only what's needed
    });

    const nextCursor = users.length === limit ? users[users.length - 1].id : null;

    res.json({
      data: users,
      nextCursor, // client sends this back for the next page
      hasMore: nextCursor !== null,
    });
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast:**
- Always fetches a **small chunk** (20–100 rows).
- Cursor pagination is faster than `OFFSET` because PostgreSQL doesn't scan skipped rows.
- Server memory stays low no matter the dataset size.

---

## 3. Sequential vs Parallel Async Operations

> If tasks don't depend on each other, run them at the same time.

### 🐌 Slow Code

```ts
app.get('/dashboard/:userId', async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  // ❌ Each awaits the previous one — they run one after another
  const user    = await prisma.user.findUnique({ where: { id: userId } }); // 50ms
  const posts   = await prisma.post.findMany({ where: { userId } });        // 60ms
  const orders  = await prisma.order.findMany({ where: { userId } });       // 70ms
  const profile = await prisma.profile.findUnique({ where: { userId } });   // 40ms
  // Total: 50 + 60 + 70 + 40 = 220ms 😩

  res.json({ user, posts, orders, profile });
});
```

**Why it's slow:**
- Each query waits for the previous one to finish.
- Total time = **sum of all query times** = ~220ms.
- Under 1M concurrent users, this stacks up massively.

### ⚡ Fast Code

```ts
app.get('/dashboard/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.userId);

    // ✅ Run ALL queries at the SAME TIME with Promise.all
    const [user, posts, orders, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),    // 50ms ─┐
      prisma.post.findMany({ where: { userId } }),           // 60ms  │ all run
      prisma.order.findMany({ where: { userId } }),          // 70ms  │ in parallel
      prisma.profile.findUnique({ where: { userId } }),      // 40ms ─┘
    ]);
    // Total: max(50, 60, 70, 40) = 70ms ✅ — 3x faster!

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user, posts, orders, profile });
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast:**
- All 4 queries fire at the same time.
- Total time = **longest single query** (~70ms instead of 220ms).
- **3x faster** with zero extra cost.

---

## 4. No Caching vs Redis Caching

> For data that doesn't change every second (e.g. product list, config), don't hit PostgreSQL on every request.

### 🐌 Slow Code

```ts
app.get('/products', async (req: Request, res: Response) => {
  // ❌ Hits PostgreSQL on EVERY single request
  // 10,000 requests/sec = 10,000 DB queries/sec — PostgreSQL melts
  const products = await prisma.product.findMany({
    where: { isActive: true },
  });

  res.json(products);
});
```

**Why it's slow:**
- Product data rarely changes, but DB is queried every single time.
- At 1M users, PostgreSQL becomes the bottleneck.

### ⚡ Fast Code

```ts
// Install: npm install ioredis
// lib/redis.ts
import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URL!);

// In your route
import { redis } from '../lib/redis';

const CACHE_TTL = 60; // cache for 60 seconds

app.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'products:active';

    // Step 1: Check Redis cache FIRST (memory lookup — sub-millisecond)
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached)); // ✅ returned in < 1ms — no DB hit!
      return;
    }

    // Step 2: Cache miss — query PostgreSQL
    const products = await prisma.product.findMany({
      where: { isActive: true },
    });

    // Step 3: Store in Redis for 60 seconds
    await redis.set(cacheKey, JSON.stringify(products), 'EX', CACHE_TTL);

    res.json(products);
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast:**
- 1M requests → **1 DB query** (first request) + 999,999 Redis hits (~0.1ms each).
- Redis handles **1M+ operations/second** easily.
- PostgreSQL is almost completely offloaded.

---

## 5. No Database Indexing vs Proper Indexing

> Without indexes, PostgreSQL does a full table scan — reads EVERY row to find matches.

### 🐌 Slow Code (Missing Index)

```prisma
// prisma/schema.prisma — NO indexes
model User {
  id    Int    @id @default(autoincrement())
  email String // ❌ no index — searching by email = full table scan!
  name  String
}

model Post {
  id        Int  @id @default(autoincrement())
  userId    Int  // ❌ no index — filtering by userId scans ALL posts!
  title     String
  createdAt DateTime @default(now())
}
```

```ts
// This query is SLOW without index — scans ALL rows in users table
const user = await prisma.user.findFirst({ where: { email: 'john@example.com' } });

// This query scans ALL posts without an index on userId
const posts = await prisma.post.findMany({ where: { userId: 5 } });
```

**Why it's slow:**
- 1M users table: finding by email scans **all 1M rows**.
- PostgreSQL: O(n) scan instead of O(log n) index lookup.
- Query time: **seconds** instead of **milliseconds**.

### ⚡ Fast Code (With Indexes)

```prisma
// prisma/schema.prisma — WITH proper indexes
model User {
  id    Int    @id @default(autoincrement())
  email String @unique          // ✅ unique index — O(log n) lookup!
  name  String

  posts    Post[]
  @@index([name])               // ✅ index for searching by name
}

model Post {
  id        Int      @id @default(autoincrement())
  userId    Int
  title     String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])             // ✅ critical index — fast filter by userId
  @@index([createdAt])          // ✅ index for time-based sorting
  @@index([userId, createdAt])  // ✅ composite index for common query pattern
}
```

```ts
// Now these queries are FAST — uses index, not full table scan
const user = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
// ✅ O(log n) — instant even with 1M rows

const posts = await prisma.post.findMany({
  where: { userId: 5 },
  orderBy: { createdAt: 'desc' },
});
// ✅ Uses composite index — milliseconds even with 10M posts
```

**After adding indexes, run:**

```bash
npx prisma migrate dev --name add_indexes
```

**Why it's fast:**
- Index lookup is **O(log n)** vs full scan **O(n)**.
- At 1M rows: index = ~20 comparisons, full scan = ~1,000,000 comparisons.
- **1000x+ speed improvement** for filtered/sorted queries.

---

## 6. Blocking the Event Loop

> Node.js is single-threaded. Heavy CPU work on the main thread blocks ALL requests.

### 🐌 Slow Code

```ts
app.post('/export-report', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany(); // 1M users

  // ❌ Heavy CPU loop running on the MAIN thread
  // While this runs, ALL other requests are COMPLETELY BLOCKED
  let report = '';
  for (const user of users) {
    report += `${user.id},${user.name},${user.email}\n`; // heavy string concat
  }

  res.send(report);
});
```

**Why it's slow:**
- The `for` loop blocks Node.js event loop for seconds.
- During this time, **zero other requests** can be processed.
- 1 user making this request = everyone else waits.

### ⚡ Fast Code

```ts
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import path from 'path';

// Option A: Use Worker Threads for CPU-heavy work
// workers/report.worker.ts
if (!isMainThread) {
  const { users } = workerData;
  let report = '';
  for (const user of users) {
    report += `${user.id},${user.name},${user.email}\n`;
  }
  parentPort?.postMessage(report); // send result back to main thread
}

// Option B (Better for large data): Stream the response — never block
import { Transform } from 'stream';

app.get('/export-report', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');

  res.write('id,name,email\n'); // header row

  // ✅ Process users in small batches — yields control between each batch
  let cursor: number | undefined;
  const batchSize = 500;

  while (true) {
    const batch = await prisma.user.findMany({
      take: batchSize,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { id: 'asc' },
      select: { id: true, name: true, email: true },
    });

    if (batch.length === 0) break;

    const csv = batch.map(u => `${u.id},${u.name},${u.email}`).join('\n');
    res.write(csv + '\n');

    cursor = batch[batch.length - 1].id;

    // Yield to event loop between batches — other requests can run!
    await new Promise(resolve => setImmediate(resolve));
  }

  res.end();
});
```

**Why it's fast:**
- Response is **streamed** in chunks — no memory spike.
- `setImmediate` between batches gives the event loop breathing room.
- Other requests are **never blocked**.

---

## 7. No Connection Pooling vs Prisma Connection Pool

> Every DB request needs a connection. Without pooling, you open/close connections constantly.

### 🐌 Slow Code

```ts
// ❌ Creating a new PrismaClient on every request
app.get('/users', async (req: Request, res: Response) => {
  const prisma = new PrismaClient(); // new connection opened!
  const users = await prisma.user.findMany();
  await prisma.$disconnect(); // connection closed!
  res.json(users);
});
```

**Why it's slow:**
- Opening a PostgreSQL connection takes **50–100ms** each time.
- At 1M requests, this adds **50–100 seconds** of wasted connection overhead.
- PostgreSQL has a hard limit on simultaneous connections (~100 by default).

### ⚡ Fast Code

```ts
// lib/prisma.ts — ONE singleton client shared across the whole app
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ?? new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Prisma's built-in connection pool — tune for your server
    // Default pool size = (num_physical_cores * 2) + 1
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
```

**Tune the pool size in `DATABASE_URL`:**

```env
# postgresql://user:pass@host:5432/db?schema=public&connection_limit=20&pool_timeout=20
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public&connection_limit=20"
```

**Why it's fast:**
- Connections are **reused** from a pool — no open/close overhead.
- `connection_limit=20` keeps 20 warm connections ready at all times.
- For 1M users, add **PgBouncer** (PostgreSQL connection pooler) in front of PostgreSQL.

---

## 8. No Response Compression vs Gzip Compression

> Large JSON responses waste bandwidth and slow down the client.

### 🐌 Slow Code

```ts
import express from 'express';

const app = express();
// ❌ No compression — sending raw, uncompressed JSON

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({ take: 1000 });
  res.json(users); // might be 500KB of raw JSON
});
```

**Why it's slow:**
- 1000 users = ~500KB uncompressed JSON.
- At 1M requests/day = **500GB of bandwidth** wasted.
- Clients on slow networks wait much longer.

### ⚡ Fast Code

```ts
// Install: npm install compression
// Install types: npm install -D @types/compression
import express from 'express';
import compression from 'compression';

const app = express();

// ✅ Add compression BEFORE all routes
app.use(compression({
  level: 6,          // compression level (1=fast, 9=best compression; 6 is the sweet spot)
  threshold: 1024,   // only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress Server-Sent Events (SSE) or already-compressed formats
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

app.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({ take: 1000 });
    res.json(users); // ✅ automatically gzip-compressed
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast:**
- Gzip reduces JSON response size by **60–80%**.
- 500KB → ~100KB per response.
- At 1M requests/day = **400GB bandwidth saved**.
- Faster response time for clients, especially on mobile.

---

## 9. Fetching All Columns vs Selecting Only Needed Columns

> Never ask PostgreSQL for data you don't need.

### 🐌 Slow Code

```ts
app.get('/users/list', async (req: Request, res: Response) => {
  // ❌ Fetches ALL columns: id, name, email, password, bio, avatar,
  //    createdAt, updatedAt, preferences, address, phone...
  const users = await prisma.user.findMany({ take: 100 });

  // But we only use id, name, email on the frontend!
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email })));
});
```

**Why it's slow:**
- Fetches 15 columns but only uses 3.
- More data transferred from PostgreSQL → more memory used → slower.
- Network transfer between DB server and app server is wasted.

### ⚡ Fast Code

```ts
app.get('/users/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ SELECT only the 3 columns we actually need
    const users = await prisma.user.findMany({
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        // Everything else is NOT fetched from PostgreSQL
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast:**
- PostgreSQL transfers **3 columns** instead of 15.
- Less data = faster query, less memory, faster response.
- **3x–5x less data** transferred on every request.

---

## 10. No Rate Limiting vs Rate Limiting

> Without rate limiting, one bad actor can send millions of requests and crash your server.

### 🐌 Slow Code

```ts
const app = express();

// ❌ No rate limiting — anyone can send 1M requests per second
app.post('/login', async (req: Request, res: Response) => {
  // attacker brute-forces passwords or just DDoS's the server
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  // ...
});
```

**Why it's dangerous:**
- A single attacker can DDoS your server.
- PostgreSQL gets hammered with malicious requests.
- Legitimate users can't get through.

### ⚡ Fast Code

```ts
// Install: npm install express-rate-limit
// Install: npm install rate-limit-redis ioredis (for distributed rate limiting)
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from './lib/redis';

// General API rate limit: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute window
  max: 100,              // max 100 requests per IP
  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in a minute.',
  },
  // ✅ Use Redis store for distributed rate limiting across multiple servers
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

// Strict login limiter: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Try again in 15 minutes.',
  },
});

// Apply globally
app.use('/api/', generalLimiter);

// Apply strictly to sensitive routes
app.post('/api/auth/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // login logic
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast and safe:**
- Blocks abusive IPs before they reach your DB.
- Redis store works across **multiple server instances** (cluster mode).
- Legitimate users at normal usage are never affected.

---

## 11. Single Process vs Cluster Mode

> Node.js is single-threaded by default — it only uses 1 CPU core. A server with 8 cores runs at 12.5% capacity!

### 🐌 Slow Code

```ts
// server.ts — runs on ONE CPU core only
import app from './app';

app.listen(3000, () => {
  console.log('Server running on port 3000');
  // ❌ Using 1 of 8 CPU cores — 87.5% of your server's power is WASTED
});
```

**Why it's slow:**
- 1 Node.js process = 1 CPU core used.
- 8-core server: only 12.5% capacity utilized.
- One slow request can delay all others.

### ⚡ Fast Code

```ts
// cluster.ts — uses ALL CPU cores
import cluster from 'cluster';
import os from 'os';
import { logger } from './logger';

const numCPUs = os.cpus().length; // e.g. 8 cores

if (cluster.isPrimary) {
  logger.info(`Primary process ${process.pid} running`);
  logger.info(`Spawning ${numCPUs} workers for ${numCPUs} CPU cores`);

  // Fork one worker per CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker crashes, restart it automatically
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // Each worker runs the Express app independently
  import('./app').then(({ default: app }) => {
    app.listen(3000, () => {
      logger.info(`Worker ${process.pid} started on port 3000`);
    });
  });
}
```

**Even better — use PM2 (production standard):**

```bash
# Install PM2
npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-api',
    script: 'dist/server.js',
    instances: 'max',       // use ALL CPU cores
    exec_mode: 'cluster',   // cluster mode
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
    },
  }],
};

# Run in cluster mode
pm2 start ecosystem.config.js --env production
```

**Why it's fast:**
- 8 CPU cores = **8 Node.js processes** handling requests simultaneously.
- **8x throughput** with zero code changes to your Express app.
- PM2 handles automatic restarts and load balancing.

---

## 12. Streaming Large Data

> When sending huge amounts of data, stream it — don't buffer the whole thing in memory.

### 🐌 Slow Code

```ts
app.get('/export/users.csv', async (req: Request, res: Response) => {
  // ❌ Loads ALL 1M users into memory at once — then sends
  const users = await prisma.user.findMany(); // 1M rows in RAM!

  const csv = users.map(u => `${u.id},${u.name},${u.email}`).join('\n');
  res.send(csv); // sends 200MB+ string all at once
});
```

**Why it's slow:**
- 1M users = ~200MB in RAM just for this request.
- If 10 users request this simultaneously = **2GB RAM** consumed.
- Server runs out of memory and crashes.

### ⚡ Fast Code

```ts
app.get('/export/users.csv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');

    // Write CSV header
    res.write('id,name,email\n');

    const BATCH_SIZE = 1000;
    let cursor: number | undefined;

    // ✅ Stream in batches — memory stays constant regardless of dataset size
    while (true) {
      const batch = await prisma.user.findMany({
        take: BATCH_SIZE,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { id: 'asc' },
        select: { id: true, name: true, email: true },
      });

      if (batch.length === 0) break;

      // Write this batch to the response stream immediately
      const rows = batch.map(u => `${u.id},${u.name},${u.email}`).join('\n');
      res.write(rows + '\n');

      cursor = batch[batch.length - 1].id;

      // Let the event loop breathe between batches
      await new Promise<void>(resolve => setImmediate(resolve));
    }

    res.end(); // done!
  } catch (error) {
    next(error);
  }
});
```

**Why it's fast:**
- Memory usage stays **constant** (~a few MB for 1 batch).
- Client starts receiving data **immediately** (streaming).
- Works for **any dataset size** — 1K or 100M rows.
- Multiple users can export simultaneously without OOM crashes.

---

## 🏁 Quick Reference Summary

| # | Problem | Slow Approach | Fast Approach | Speed Gain |
|---|---------|--------------|--------------|------------|
| 1 | N+1 Queries | `findMany` in a loop | Prisma `include` (JOIN) | 10x–100x |
| 2 | Loading all data | `findMany()` (all rows) | Cursor-based pagination | ∞ (prevents crash) |
| 3 | Sequential await | `await` one-by-one | `Promise.all()` parallel | 3x–5x |
| 4 | No caching | DB query every request | Redis cache + DB fallback | 100x–1000x |
| 5 | No DB indexes | Full table scan O(n) | Index lookup O(log n) | 1000x |
| 6 | Blocking event loop | Heavy loop on main thread | Stream + `setImmediate` | Prevents 100% block |
| 7 | No connection pool | New connection per request | Prisma singleton + pool | 50ms saved per req |
| 8 | No compression | Raw JSON response | Gzip compression | 3x–5x smaller payload |
| 9 | Fetching all columns | `findMany()` all fields | Prisma `select` | 3x–5x less data |
| 10 | No rate limiting | Unlimited requests | Rate limiter + Redis | Prevents DDoS crash |
| 11 | Single process | 1 CPU core | Cluster / PM2 (all cores) | 8x throughput |
| 12 | Buffered large data | Load all then send | Stream in batches | Prevents OOM crash |

---

> 🚀 **Golden Rule**: For 1 Million users — **query less, cache more, stream everything big, and run on all CPU cores.**
