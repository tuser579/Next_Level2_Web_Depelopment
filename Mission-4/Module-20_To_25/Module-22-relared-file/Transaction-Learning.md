# 🔄 Prisma Transactions — Beginner to Advanced Learning Guide

> **Reference Docs:** [Prisma Transactions Overview](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) | [Interactive Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions) | [Sequential Operations](https://www.prisma.io/docs/orm/prisma-client/queries/transactions#sequential-prisma-client-operations)

---

## 📚 Table of Contents

1. [What is a Transaction?](#1-what-is-a-transaction)
2. [Why Do We Need Transactions?](#2-why-do-we-need-transactions)
3. [ACID Properties — The Foundation](#3-acid-properties--the-foundation)
4. [Prisma's Two Transaction APIs](#4-prismas-two-transaction-apis)
5. [Sequential / Batch Transactions](#5-sequential--batch-transactions)
6. [Interactive Transactions (Most Powerful)](#6-interactive-transactions-most-powerful)
7. [Real Project Examples (Prisma Press)](#7-real-project-examples-prisma-press)
8. [Error Handling & Rollbacks](#8-error-handling--rollbacks)
9. [Transaction Configuration (Timeout, maxWait)](#9-transaction-configuration-timeout-maxwait)
10. [Best Use Cases](#10-best-use-cases)
11. [Common Mistakes to Avoid](#11-common-mistakes-to-avoid)
12. [Advanced Patterns](#12-advanced-patterns)
13. [Quick Reference Cheat Sheet](#13-quick-reference-cheat-sheet)

---

## 1. What is a Transaction?

A **transaction** is a group of database operations that are treated as a **single unit of work**.

Think of it like this:

> 🏦 **Bank Transfer Analogy**
> You transfer ৳5000 from your account to a friend.
> - Step 1: **Deduct** ৳5000 from your account
> - Step 2: **Add** ৳5000 to your friend's account
>
> If Step 2 **fails** (network error, server crash), Step 1 must be **undone** automatically.
> Without a transaction, you'd lose ৳5000 into thin air! 💸

**Either ALL operations succeed, or NONE of them take effect.**

---

## 2. Why Do We Need Transactions?

| Without Transaction | With Transaction |
|---|---|
| Partial writes possible | All-or-nothing guarantee |
| Data can get corrupted | Data stays consistent |
| Hard to debug failures | Automatic rollback on error |
| Race conditions possible | Isolation between concurrent users |

### Real-world scenarios that need transactions:
- 💳 Payment processing (debit + credit)
- 👤 User registration (create user + create profile + send welcome email log)
- 📦 Order placement (reduce stock + create order + create payment record)
- 📊 Dashboard stats (read multiple tables with consistent snapshot)
- 📝 Blog post view counting (increment views + fetch updated post)

---

## 3. ACID Properties — The Foundation

Every transaction must follow **ACID** principles:

```
A — Atomicity    → All or nothing
C — Consistency  → Data goes from one valid state to another
I — Isolation    → Concurrent transactions don't interfere
D — Durability   → Committed data persists even after crashes
```

### Visual breakdown:

```
Transaction Start
│
├── Operation 1: INSERT user ✅
├── Operation 2: INSERT profile ✅
├── Operation 3: INSERT wallet ❌ ERROR!
│
└── ROLLBACK → All 3 operations are UNDONE
    Database is exactly as it was before the transaction
```

vs.

```
Transaction Start
│
├── Operation 1: INSERT user ✅
├── Operation 2: INSERT profile ✅
├── Operation 3: INSERT wallet ✅
│
└── COMMIT → All 3 operations are permanently saved
```

---

## 4. Prisma's Two Transaction APIs

Prisma gives you **two ways** to use transactions:

| API | When to Use |
|---|---|
| `prisma.$transaction([...])` | Simple, independent operations — batch them together |
| `prisma.$transaction(async (tx) => {...})` | Complex logic, conditionals, loops — full control |

```
                    ┌─────────────────────────────────┐
                    │    prisma.$transaction()        │
                    └──────────────┬──────────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               │                                       │
    ┌──────────▼──────────┐              ┌─────────────▼──────────┐
    │  Sequential / Batch │              │ Interactive Transaction │
    │  prisma.$transaction│              │  prisma.$transaction    │
    │  ([op1, op2, op3])  │              │  (async (tx) => { ... })│
    └─────────────────────┘              └────────────────────────┘
    • Simple, no control flow            • Complex logic
    • Runs in order                      • Can use if/else, loops
    • Less boilerplate                   • Reads + writes together
                                         • Manual tx client (tx.xxx)
```

---

## 5. Sequential / Batch Transactions

Pass an **array of Prisma operations**. They execute in order, all in one transaction.

### Basic Syntax

```typescript
const [result1, result2, result3] = await prisma.$transaction([
  prisma.user.create({ data: { name: "Alice" } }),
  prisma.post.create({ data: { title: "Hello World", authorId: "..." } }),
  prisma.comment.create({ data: { content: "Nice post!", postId: "..." } }),
]);
```

> ⚠️ These are **Prisma Promise** objects — don't `await` them inside the array!

### ✅ Good — Correct way

```typescript
// Don't await inside the array
const operations = [
    prisma.post.count(),
    prisma.comment.count(),
    prisma.user.count(),
];

const [postCount, commentCount, userCount] = await prisma.$transaction(operations);
```

### ❌ Bad — Wrong way 

```typescript
// This runs OUTSIDE the transaction!
const operations = [
    await prisma.post.count(),    // ← Don't await here!
    await prisma.comment.count(), // ← These execute immediately
];
```

### When to use Sequential Transactions

- Simple read-multiple or write-multiple operations
- No conditional logic needed between steps
- Operations don't depend on each other's return values within the transaction

--- 

## 6. Interactive Transactions (Most Powerful)

Pass an **async function** that receives a special `tx` (transaction client). Use `tx` instead of `prisma` for all operations inside.

### Basic Syntax

```typescript
const result = await prisma.$transaction(async (tx) => {
    // Use tx.xxx instead of prisma.xxx
    const user = await tx.user.create({ data: { name: "Bob" } });
    
    const profile = await tx.profile.create({
        data: {
            bio: "Hello!",
            userId: user.id  // ← use result from previous step!
        }
    });

    return { user, profile }; // ← what you return here is what $transaction returns
});

// result = { user: {...}, profile: {...} }
```

### How it works under the hood

```
prisma.$transaction(async (tx) => {
    │
    ├── BEGIN TRANSACTION  ← Prisma does this automatically
    │
    ├── tx.user.create(...)    ← Operation 1
    ├── tx.profile.create(...) ← Operation 2 (can use result of Op 1)
    ├── tx.wallet.create(...)  ← Operation 3
    │
    ├── return data
    │
    └── COMMIT TRANSACTION ← Prisma does this automatically
        (OR ROLLBACK if any operation throws an error)
})
```

### Conditional logic inside a transaction

```typescript
const transferMoney = async (fromId: string, toId: string, amount: number) => {
    return await prisma.$transaction(async (tx) => {
        // Step 1: Check sender's balance
        const sender = await tx.wallet.findUniqueOrThrow({
            where: { userId: fromId }
        });

        // Step 2: Business logic INSIDE transaction
        if (sender.balance < amount) {
            throw new Error("Insufficient funds"); // ← This will ROLLBACK!
        }

        // Step 3: Deduct from sender
        const updatedSender = await tx.wallet.update({
            where: { userId: fromId },
            data: { balance: { decrement: amount } }
        });

        // Step 4: Add to receiver
        const updatedReceiver = await tx.wallet.update({
            where: { userId: toId },
            data: { balance: { increment: amount } }
        });

        return { sender: updatedSender, receiver: updatedReceiver };
    });
};
```

---

## 7. Real Project Examples (Prisma Press)

These are **actual examples** from our `post.service.ts` in this project!

### Example 1: `getPostById` — View Count + Fetch (Read-Write Transaction)

**The Problem:** We need to:
1. Increment the `views` counter on the post
2. Return the post with its updated view count + author + comments

If we do these as separate queries (without a transaction), there's a race condition: another user might read the post between our increment and fetch, getting a stale count.

**The Solution:**

```typescript
// src/modules/post/post.service.ts

const getPostById = async (postId: string) => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            // Step 1: Increment view count
            await tx.post.update({
                where: { id: postId },
                data: {
                    views: { increment: 1 }  // atomic increment!
                }
            });

            // Step 2: Fetch the updated post with relations
            // Both operations happen in the SAME database snapshot
            const post = await tx.post.findUnique({
                where: { id: postId },
                include: {
                    author: {
                        select: { name: true, email: true }
                    },
                    comments: {
                        where: { status: CommentStatus.APPROVED },
                        orderBy: { createdAt: "desc" }
                    },
                    _count: {
                        select: { comments: true }
                    }
                }
            });

            return post;
        }
    );

    return transactionResult;
};
```

**Why `tx.post.findUnique` instead of `prisma.post.findUnique` here?**
> Using `tx` ensures both the update and the fetch happen within the SAME transaction. If we used `prisma.post.findUnique`, it would run as a separate connection outside the transaction — we might get inconsistent data.

---

### Example 2: `getPostsStats` — Dashboard Analytics (Read-Only Transaction)

**The Problem:** We want to show a dashboard with multiple stats:
- Total posts, views, featured posts
- Posts by status (Published / Draft / Archived)
- Comments (total / approved / rejected)

If these 9 queries run separately, some might complete while others are still running — and in between, another user could be creating posts! The stats would be **inconsistent** (post count increases but comment count reflects old data).

**The Solution:** Read everything inside one transaction (consistent database snapshot):

```typescript
// src/modules/post/post.service.ts

const getPostsStats = async () => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            // All 9 queries see the EXACT same database state
            const [
                totalPost,
                totalPostViewsAggregate,
                totalFeaturedPost,
                totalPublishedPost,
                totalDraftPost,
                totalArchivedPost,
                totalComments,
                totalApprovedComments,
                totalRejectedComments
            ] = await Promise.all([
                tx.post.count(),
                tx.post.aggregate({
                    _sum: { views: true }
                }),
                tx.post.count({ where: { isFeatured: true } }),
                tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
                tx.post.count({ where: { status: PostStatus.DRAFT } }),
                tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
                tx.comment.count(),
                tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
                tx.comment.count({ where: { status: CommentStatus.REJECTED } })
            ]);

            return {
                totalPost,
                totalPostViewsCount: totalPostViewsAggregate._sum.views,
                totalFeaturedPost,
                totalPublishedPost,
                totalDraftPost,
                totalArchivedPost,
                totalComments,
                totalApprovedComments,
                totalRejectedComments
            };
        }
    );

    return transactionResult;
};
```

> 💡 **Key insight:** `Promise.all` inside `tx` runs all queries **concurrently** but within the **same transaction**. This is both fast AND consistent!

---

### Example 3: User Registration (Create User + Profile Together)

```typescript
// A common pattern: create parent + child record atomically

const registerUser = async (payload: IRegisterPayload) => {
    return await prisma.$transaction(async (tx) => {
        // Hash password
        const hashedPassword = await bcrypt.hash(payload.password, 12);

        // Create user
        const user = await tx.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: hashedPassword,
            }
        });

        // Create profile for user (uses user.id from above)
        const profile = await tx.profile.create({
            data: {
                bio: payload.bio ?? "",
                userId: user.id,  // ← chained from previous operation
            }
        });

        // If profile creation fails → user creation is ROLLED BACK too
        return { user, profile };
    });
};
```

---

## 8. Error Handling & Rollbacks

### Automatic Rollback

Any **thrown error** inside `$transaction` triggers an automatic rollback:

```typescript
await prisma.$transaction(async (tx) => {
    await tx.user.create({ data: { name: "Alice" } }); // ✅ runs
    await tx.post.create({ data: { title: "Post" } }); // ✅ runs

    throw new Error("Something went wrong!"); // 💥 throws

    // ↑ Both user and post creation are ROLLED BACK
    // Database is untouched
});
```

### Catching Errors

```typescript
try {
    const result = await prisma.$transaction(async (tx) => {
        // ... operations
    });
    
    console.log("Transaction succeeded:", result);
} catch (error) {
    // Transaction was automatically rolled back
    console.error("Transaction failed, all changes reverted:", error);
    throw error; // re-throw so the controller handles it
}
```

### Testing Rollback (the commented code in your project!)

```typescript
// This is the "fake error" pattern used in your getPostById:
const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
        where: { id: postId },
        data: { views: { increment: 1 } }
    });

    // Uncomment to test rollback — view count will NOT be incremented
    // throw new Error("Something went wrong");

    const post = await tx.post.findUnique({ where: { id: postId } });
    return post;
});
```

### Prisma-specific errors inside transactions

```typescript
import { Prisma } from "@prisma/client";

try {
    await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: { email: "duplicate@email.com" } // might already exist
        });
    });
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            // Unique constraint violation (duplicate email)
            throw new Error("Email already exists");
        }
    }
    throw error;
}
```

Common Prisma error codes in transactions:

| Code | Meaning |
|---|---|
| `P2002` | Unique constraint violation |
| `P2025` | Record not found (`findUniqueOrThrow` failed) |
| `P2003` | Foreign key constraint violation |
| `P2034` | Transaction conflict (deadlock) — safe to retry |

---

## 9. Transaction Configuration (Timeout, maxWait)

Interactive transactions have configurable timeouts to prevent long-running transactions from blocking the database.

### Default values
```
timeout  = 5000ms (5 seconds) — max time the transaction can run
maxWait  = 2000ms (2 seconds) — max time to wait for a connection from the pool
```

### Custom configuration

```typescript
await prisma.$transaction(
    async (tx) => {
        // ... your operations
    },
    {
        timeout: 10000,  // 10 seconds (for complex operations)
        maxWait: 5000,   // 5 seconds to get a connection
    }
);
```

### When to increase timeout

- Complex operations with many queries (like `getPostsStats` with 9 queries)
- Operations that call external APIs inside the transaction (not recommended, but possible)
- Large data migrations

```typescript
// Example: Extended timeout for analytics query
const getPostsStats = async () => {
    return await prisma.$transaction(
        async (tx) => {
            // ... 9 queries with Promise.all
        },
        {
            timeout: 15000, // 15 seconds for analytics
            maxWait: 3000,
        }
    );
};
```

> ⚠️ **Warning:** Don't make timeouts too long! Long transactions hold database locks and can cause performance issues for other users.

---

## 10. Best Use Cases

### ✅ USE a transaction when:

| Scenario | Why |
|---|---|
| **Creating related records** (User + Profile + Wallet) | All must exist together or not at all |
| **Financial operations** (debit + credit) | Atomicity is critical |
| **Consistent analytics/dashboards** | Avoid stale/mixed data from concurrent writes |
| **View count + fetch** (like `getPostById`) | Ensure you fetch the updated state |
| **Order placement** (reduce inventory + create order) | Prevent overselling |
| **Cascade operations with business logic** | Beyond what DB-level cascade handles |

### ❌ DON'T use a transaction when:

| Scenario | Why |
|---|---|
| **Single read operation** | No atomicity needed; adds overhead |
| **Single write operation** | Already atomic by default |
| **Calls to external APIs** inside tx | If API succeeds but DB fails, API can't be rolled back |
| **Long-running background jobs** | Holds DB locks too long |

---

## 11. Common Mistakes to Avoid

### ❌ Mistake 1: Using `prisma` instead of `tx` inside the transaction

```typescript
// WRONG — this runs OUTSIDE the transaction!
await prisma.$transaction(async (tx) => {
    await tx.user.create({ data: { name: "Alice" } });
    await prisma.profile.create({ ... }); // ← BUG: uses prisma, not tx!
});
```

```typescript
// CORRECT
await prisma.$transaction(async (tx) => {
    await tx.user.create({ data: { name: "Alice" } });
    await tx.profile.create({ ... }); // ← use tx everywhere
});
```

---

### ❌ Mistake 2: Awaiting inside batch transaction array

```typescript
// WRONG — operations execute immediately, NOT in a transaction
await prisma.$transaction([
    await prisma.post.count(),    // ← executes NOW, outside tx
    await prisma.comment.count(), // ← executes NOW, outside tx
]);
```

```typescript
// CORRECT — no await inside the array
await prisma.$transaction([
    prisma.post.count(),    // ← Prisma Promise, not yet executed
    prisma.comment.count(), // ← Prisma Promise, not yet executed
]);
```

---

### ❌ Mistake 3: Calling external APIs inside interactive transactions

```typescript
// RISKY — if DB commit fails after email is sent, email can't be "unsent"
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { ... } });
    await sendWelcomeEmail(user.email); // ← outside the DB, can't rollback!
});
```

```typescript
// BETTER — perform side effects AFTER the transaction commits
const user = await prisma.$transaction(async (tx) => {
    return await tx.user.create({ data: { ... } });
});

// Only runs if transaction committed successfully
await sendWelcomeEmail(user.email);
```

---

### ❌ Mistake 4: Nested `prisma.$transaction` calls

```typescript
// WRONG — Prisma doesn't support nested $transaction calls
await prisma.$transaction(async (tx) => {
    await prisma.$transaction(async (tx2) => { // ← Error!
        // ...
    });
});
```

```typescript
// CORRECT — keep it flat, use the same tx client
await prisma.$transaction(async (tx) => {
    await doOperation1(tx);
    await doOperation2(tx); // pass tx to helper functions
});

// Helper functions accept tx as parameter
const doOperation1 = async (tx: Prisma.TransactionClient) => {
    await tx.post.create({ ... });
};
```

---

### ❌ Mistake 5: Not handling transaction conflicts (P2034)

In high-concurrency apps, transactions can fail due to deadlocks:

```typescript
// Basic retry pattern for transaction conflicts
const retryTransaction = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2034" && // write conflict / deadlock
                attempt < retries - 1
            ) {
                console.log(`Transaction conflict, retrying... (${attempt + 1}/${retries})`);
                await new Promise(res => setTimeout(res, 50 * (attempt + 1))); // backoff
                continue;
            }
            throw error;
        }
    }
    throw new Error("Transaction failed after max retries");
};

// Usage
const result = await retryTransaction(() =>
    prisma.$transaction(async (tx) => {
        // ... your operations
    })
);
```

---

## 12. Advanced Patterns

### Pattern 1: Passing `tx` to service functions

Keep your code clean by making helper functions accept a transaction client:

```typescript
import { Prisma } from "../../generated/prisma/client";

// The type for a transaction client
type TransactionClient = Prisma.TransactionClient;

// Reusable helper that works inside OR outside a transaction
const findPostWithDetails = async (postId: string, client: TransactionClient | typeof prisma) => {
    return await client.post.findUnique({
        where: { id: postId },
        include: { author: true, comments: true }
    });
};

// Use inside a transaction
await prisma.$transaction(async (tx) => {
    await tx.post.update({ where: { id: "1" }, data: { views: { increment: 1 } } });
    const post = await findPostWithDetails("1", tx); // ← pass tx
    return post;
});

// Or use standalone (no transaction)
const post = await findPostWithDetails("1", prisma); // ← pass prisma
```

---

### Pattern 2: `Promise.all` inside a transaction (used in your project!)

Run multiple queries **concurrently** within the same transaction:

```typescript
// Sequential (slow) — each waits for the previous
const stats = await prisma.$transaction(async (tx) => {
    const posts = await tx.post.count();         // waits
    const comments = await tx.comment.count();   // waits for posts
    const users = await tx.user.count();         // waits for comments
    return { posts, comments, users };
});

// Concurrent (fast) — all run at the same time, same transaction snapshot
const stats = await prisma.$transaction(async (tx) => {
    const [posts, comments, users] = await Promise.all([
        tx.post.count(),
        tx.comment.count(),
        tx.user.count(),
    ]);
    return { posts, comments, users };
});
```

---

### Pattern 3: Read-for-Update (Pessimistic Locking)

For scenarios where you must prevent concurrent modifications:

```typescript
// Lock the row while reading, so no other transaction can modify it
await prisma.$transaction(async (tx) => {
    // This is DB-level locking - use raw queries for this
    const wallet = await tx.$queryRaw`
        SELECT * FROM wallets WHERE "userId" = ${userId} FOR UPDATE
    `;

    // Now safely update without race conditions
    await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } }
    });
});
```

---

### Pattern 4: Idempotent Transactions (Safe to Retry)

Design transactions so running them twice has the same effect as running once:

```typescript
const createOrderSafely = async (orderId: string, payload: IOrderPayload) => {
    return await prisma.$transaction(async (tx) => {
        // Check if order already exists (idempotency key)
        const existingOrder = await tx.order.findUnique({
            where: { id: orderId }
        });

        if (existingOrder) {
            return existingOrder; // Already created, return existing
        }

        // Safe to create — this is a new order
        return await tx.order.create({
            data: { id: orderId, ...payload }
        });
    });
};
```

---

## 13. Quick Reference Cheat Sheet

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. SEQUENTIAL / BATCH TRANSACTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const [r1, r2] = await prisma.$transaction([
    prisma.post.create({ data: { ... } }),   // no await!
    prisma.comment.create({ data: { ... } }) // no await!
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. INTERACTIVE TRANSACTION (basic)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const result = await prisma.$transaction(async (tx) => {
    const a = await tx.model.create({ data: { ... } });
    const b = await tx.other.create({ data: { id: a.id } }); // chain!
    return { a, b };
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. CONCURRENT QUERIES IN ONE TRANSACTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const result = await prisma.$transaction(async (tx) => {
    const [count1, count2] = await Promise.all([
        tx.post.count(),
        tx.comment.count(),
    ]);
    return { count1, count2 };
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. WITH CUSTOM TIMEOUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const result = await prisma.$transaction(
    async (tx) => { /* ... */ },
    { timeout: 10000, maxWait: 5000 }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. WITH ERROR HANDLING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
try {
    await prisma.$transaction(async (tx) => {
        // Any throw here = automatic rollback
        if (condition) throw new Error("Rollback!"); 
        await tx.model.create({ data: { ... } });
    });
} catch (err) {
    // Transaction was rolled back, handle error
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. PASSING TX TO HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type TxClient = Prisma.TransactionClient;

const helper = async (tx: TxClient) => {
    return await tx.post.findMany();
};

await prisma.$transaction(async (tx) => {
    const posts = await helper(tx);
    return posts;
});
```

---

## 📎 Official Reference Links

| Topic | Link |
|---|---|
| 📖 Transactions Overview | https://www.prisma.io/docs/orm/prisma-client/queries/transactions |
| ⚡ Interactive Transactions | https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions |
| 🔁 Sequential Transactions | https://www.prisma.io/docs/orm/prisma-client/queries/transactions#sequential-prisma-client-operations |
| ❌ Error Handling | https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors |
| 🔐 Error Codes | https://www.prisma.io/docs/orm/reference/error-reference |
| 🚀 Performance Tips | https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance |
| 🔩 Raw Database Queries | https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries |
| 🧵 Prisma Client API | https://www.prisma.io/docs/orm/reference/prisma-client-reference |

---

> 📌 **This project's transaction examples:**
> - `getPostById` → [post.service.ts](../src/modules/post/post.service.ts) (Interactive: write + read)
> - `getPostsStats` → [post.service.ts](../src/modules/post/post.service.ts) (Interactive: concurrent reads with `Promise.all`)
