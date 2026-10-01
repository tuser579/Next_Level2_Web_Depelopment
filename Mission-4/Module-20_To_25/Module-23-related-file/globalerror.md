# 🛡️ Global Error Handler — Complete Guide

> **Module 23 Reference** | Prisma Press Backend
>
> File: `src/middlewares/globalErrorHandler.ts`

---

## 📌 What is a Global Error Handler?

Normally, if something goes wrong in your app (like the database is down, or someone sends bad data), you would have to write `try/catch` in every single route and manually send an error response.

A **Global Error Handler** is a single middleware that catches **all errors** from your entire app automatically and sends a clean, consistent error response to the client.

> Think of it like a safety net 🥅 — no matter where your app throws an error, this net catches it.

---

## 📌 How Express Error Handling Works

In Express, a **normal middleware** has 3 parameters: `(req, res, next)`.

An **error-handling middleware** has **4 parameters**: `(err, req, res, next)`.

Express automatically skips to this middleware whenever any route calls `next(err)` or throws an error (when using async wrappers).

```
Request → Route Handler → Error thrown → Global Error Handler → Response sent
```

---

## 📌 How to Register It in `app.ts`

> ⚠️ **Very Important:** The global error handler must be registered **LAST** — after all routes and other middlewares.

```typescript
// app.ts
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

// ... all your routes above ...
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// ✅ Register LAST
app.use(globalErrorHandler);
```

---

## 📌 The Error Response Shape

Every error from your API will return a JSON object with this consistent shape:

```json
{
  "statusCode": 409,
  "success": false,
  "errorName": "PrismaKnownRequestError",
  "errorMessage": "Unique constraint violation on field(s): email",
  "errorDetails": { ... },
  "errorPath": "/api/users/register",
  "errorMethod": "POST",
  "errorStack": "...(only shown in development)...",
  "timestamp": "2026-10-01T12:01:09.403Z"
}
```

| Field          | Meaning                                           |
|----------------|---------------------------------------------------|
| `statusCode`   | HTTP status code (400, 401, 404, 409, 500, etc.)  |
| `success`      | Always `false` for errors                         |
| `errorName`    | The error class/type name                         |
| `errorMessage` | Human-readable description of what went wrong     |
| `errorDetails` | Extra info (e.g. which field caused the conflict) |
| `errorPath`    | The API route that was called                     |
| `errorMethod`  | HTTP method (GET, POST, PUT, DELETE)              |
| `errorStack`   | Stack trace — **hidden in production**            |
| `timestamp`    | When the error happened (ISO format)              |

---

## 📌 How Errors Reach the Handler

### ✅ Using `catchAsync` Wrapper (Recommended)

Instead of writing `try/catch` in every controller, use a wrapper utility:

```typescript
// src/utils/catchAsync.ts
import { NextFunction, Request, Response } from "express";

const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
        // .catch(next) sends error to globalErrorHandler automatically
    };
};

export default catchAsync;
```

**Usage in controller — no try/catch needed!**

```typescript
// src/modules/user/user.controller.ts
import catchAsync from "../../utils/catchAsync";
import { userService } from "./user.service";

export const registerUser = catchAsync(async (req, res) => {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({ success: true, data: result });
    // If createUserIntoDB throws, catchAsync sends it to globalErrorHandler
});
```

### 🔄 Manual `next(err)` Pattern (Alternative)

```typescript
export const registerUser = async (req, res, next) => {
    try {
        const result = await userService.createUserIntoDB(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err); // 👈 This sends the error to globalErrorHandler
    }
};
```

---

## 📌 Production vs Development Mode

```typescript
const isProduction = config.node_env === "production";

errorStack: isProduction ? null : (err?.stack ?? null),
```

Set in your `.env` file:

```env
NODE_ENV=development   # during coding — shows full stack trace
NODE_ENV=production    # when deployed — hides stack trace for security
```

| Mode          | `errorStack` in response | `console.error` logs |
|---------------|--------------------------|----------------------|
| `development` | ✅ Shown                  | ✅ Printed            |
| `production`  | ❌ Hidden (`null`)        | ❌ Silent             |

**Why hide the stack in production?**
The stack trace shows your file paths, line numbers, and internal code. Hackers can exploit this — always hide it in production!

---

## 📌 All 10 Error Types Handled

---

### 1️⃣ Prisma Validation Error

**Class:** `Prisma.PrismaClientValidationError`
**Status:** `400 Bad Request`

**When it happens:**
You called a Prisma query but passed wrong field types or forgot a required field.

**Example trigger:**
```typescript
// ❌ "name" is required but missing
await prisma.user.create({
    data: { email: "test@test.com" }
    // Missing: name, password, role, etc.
});
```

**API Response:**
```json
{
  "statusCode": 400,
  "errorName": "PrismaValidationError",
  "errorMessage": "Invalid field type or missing required fields"
}
```

---

### 2️⃣ Prisma Known Request Error (Database Constraint Errors)

**Class:** `Prisma.PrismaClientKnownRequestError`

These are errors where the database rejects your query due to rule violations. Each has a Prisma Error Code.

---

#### P2002 — Duplicate / Unique Constraint

**Status:** `409 Conflict`

**When it happens:** Trying to register a user with an email that already exists.

**Example trigger:**
```typescript
// ❌ "john@example.com" already exists in the database
await prisma.user.create({
    data: { email: "john@example.com", name: "John" }
});
```

**API Response:**
```json
{
  "statusCode": 409,
  "errorName": "PrismaKnownRequestError",
  "errorMessage": "Unique constraint violation on field(s): email",
  "errorDetails": {
    "prismaCode": "P2002",
    "meta": { ... }
  }
}
```

> 💡 **Note about driver adapter:** When using `@prisma/adapter-pg`, the field info is inside `meta.driverAdapterError.cause.constraint.index` (e.g. `"users_email_key"`). Our helper function parses this and extracts just `"email"` automatically.

---

#### P2003 — Foreign Key Constraint

**Status:** `400 Bad Request`

**When it happens:** Trying to create a post with a `userId` that doesn't exist.

**Example trigger:**
```typescript
// ❌ User with id "abc-999" does not exist
await prisma.post.create({
    data: { title: "Hello", authorId: "abc-999" }
});
```

**API Response:**
```json
{
  "statusCode": 400,
  "errorMessage": "Foreign key constraint failed on field: authorId"
}
```

---

#### P2025 — Record Not Found

**Status:** `404 Not Found`

**When it happens:** Trying to update or delete something that doesn't exist.

**Example trigger:**
```typescript
// ❌ Post with this id doesn't exist
await prisma.post.update({
    where: { id: "nonexistent-id" },
    data: { title: "New Title" }
});
```

**API Response:**
```json
{
  "statusCode": 404,
  "errorMessage": "Record to update not found."
}
```

---

#### Other Prisma P2xxx Codes

| Code    | Status | What it means                       |
|---------|--------|-------------------------------------|
| `P2000` | 400    | Input value too long for field      |
| `P2001` | 404    | Record does not exist               |
| `P2004` | 400    | General database constraint failed  |
| `P2005` | 400    | Invalid value stored in database    |
| `P2006` | 400    | Provided value not valid for field  |
| `P2011` | 400    | Null constraint violated            |

---

### 3️⃣ Prisma Initialization Error (Connection Problems)

**Class:** `Prisma.PrismaClientInitializationError`

**When it happens:** Your `.env` DATABASE_URL is wrong, or the database server is down.

| Code    | Status | What it means                      |
|---------|--------|------------------------------------|
| `P1000` | 401    | Wrong DB username or password      |
| `P1001` | 503    | DB server is unreachable/down      |
| `P1002` | 408    | DB connection timed out            |
| `P1003` | 404    | Database does not exist            |
| `P1008` | 408    | DB query operation timed out       |
| `P1009` | 409    | Database already exists            |
| `P1010` | 403    | DB user denied access/permissions  |

**Example Response (wrong credentials):**
```json
{
  "statusCode": 401,
  "errorName": "PrismaInitializationError",
  "errorMessage": "Database authentication failed. Please check credentials"
}
```

---

### 4️⃣ Prisma Unknown Request Error

**Class:** `Prisma.PrismaClientUnknownRequestError`
**Status:** `500 Internal Server Error`

**When it happens:** A DB error occurred but Prisma doesn't know the specific cause. Very rare.

```json
{
  "statusCode": 500,
  "errorName": "PrismaUnknownRequestError",
  "errorMessage": "An unknown error occurred during the database query"
}
```

---

### 5️⃣ Prisma Rust Panic Error

**Class:** `Prisma.PrismaClientRustPanicError`
**Status:** `500 Internal Server Error`

**When it happens:** Prisma's internal engine crashes. Extremely rare — usually a Prisma bug.

```json
{
  "statusCode": 500,
  "errorName": "PrismaRustPanicError",
  "errorMessage": "A critical internal database engine error occurred"
}
```

---

### 6️⃣ Zod Validation Error

**Name:** `ZodError`
**Status:** `422 Unprocessable Entity`

**When it happens:** You use Zod to validate request body and the user sends invalid data.

**Example trigger:**
```typescript
import { z } from "zod";
const schema = z.object({ email: z.string().email() });
schema.parse({ email: "not-a-valid-email" }); // ❌ throws ZodError
```

**API Response:**
```json
{
  "statusCode": 422,
  "errorName": "ZodValidationError",
  "errorMessage": "Request validation failed",
  "errorDetails": {
    "issues": [
      {
        "path": ["email"],
        "message": "Invalid email"
      }
    ]
  }
}
```

---

### 7️⃣ JWT Errors

**Status:** `401 Unauthorized`

Three JWT error types are handled:

| Error Name          | When it happens                                |
|---------------------|------------------------------------------------|
| `JsonWebTokenError` | Token is fake, tampered, or malformed          |
| `TokenExpiredError` | User's login token has passed its expiry time  |
| `NotBeforeError`    | Token used before its valid-from time          |

**Example trigger (expired token):**
```typescript
import jwt from "jsonwebtoken";
jwt.verify("old.expired.token", secret);
// Throws: TokenExpiredError: jwt expired
```

**API Response:**
```json
{
  "statusCode": 401,
  "errorName": "TokenExpiredError",
  "errorMessage": "Your session has expired. Please log in again"
}
```

---

### 8️⃣ JSON Syntax Error

**Status:** `400 Bad Request`

**When it happens:** Client sends a broken JSON body (missing bracket, trailing comma, etc.)

**Example — Postman request with bad JSON:**
```
POST /api/users/register
Body: { "name": "John"    ← missing closing brace
```

**API Response:**
```json
{
  "statusCode": 400,
  "errorName": "JSONSyntaxError",
  "errorMessage": "Malformed JSON in request body"
}
```

---

### 9️⃣ Generic HTTP Errors

**Status:** Dynamic (from the error object)

**When it happens:** You use the `http-errors` package to manually throw HTTP errors.

**Example trigger:**
```typescript
import createError from "http-errors";
throw createError(403, "You do not have permission to access this resource");
```

**API Response:**
```json
{
  "statusCode": 403,
  "errorName": "ForbiddenError",
  "errorMessage": "You do not have permission to access this resource"
}
```

---

### 🔟 Generic / Fallback Error

**Status:** `500 Internal Server Error`

**When it happens:** Any other JavaScript `Error` that didn't match any of the above cases. Last safety net.

**Example trigger:**
```typescript
throw new Error("Something unexpected happened");
```

**API Response:**
```json
{
  "statusCode": 500,
  "errorName": "Error",
  "errorMessage": "Something unexpected happened"
}
```

---

## 📌 Complete Error Quick Reference Table

| # | Error Type                     | Status | Error Name                  | Typical Cause                           |
|---|--------------------------------|--------|-----------------------------|-----------------------------------------|
| 1 | Prisma Validation              | 400    | `PrismaValidationError`     | Wrong field type or missing field       |
| 2 | Prisma P2000                   | 400    | `PrismaKnownRequestError`   | Value too long for column               |
| 2 | Prisma P2001                   | 404    | `PrismaKnownRequestError`   | Record does not exist                   |
| 2 | Prisma P2002 (duplicate)       | 409    | `PrismaKnownRequestError`   | Email/username already taken            |
| 2 | Prisma P2003 (foreign key)     | 400    | `PrismaKnownRequestError`   | Related record (userId etc) not found   |
| 2 | Prisma P2025 (not found)       | 404    | `PrismaKnownRequestError`   | Record to update/delete doesn't exist   |
| 3 | Prisma P1000 (credentials)     | 401    | `PrismaInitializationError` | Wrong DB username/password in .env      |
| 3 | Prisma P1001 (unreachable)     | 503    | `PrismaInitializationError` | DB server is down/unreachable           |
| 3 | Prisma P1002 (timeout)         | 408    | `PrismaInitializationError` | DB connection timed out                 |
| 4 | Prisma Unknown                 | 500    | `PrismaUnknownRequestError` | Unknown DB query error                  |
| 5 | Prisma Rust Panic              | 500    | `PrismaRustPanicError`      | Critical Prisma engine crash            |
| 6 | Zod Validation                 | 422    | `ZodValidationError`        | Request body fails schema validation    |
| 7 | JWT Invalid                    | 401    | `JsonWebTokenError`         | Token is fake or tampered               |
| 7 | JWT Expired                    | 401    | `TokenExpiredError`         | Login session expired                   |
| 7 | JWT Not Active                 | 401    | `NotBeforeError`            | Token used before valid time            |
| 8 | JSON Syntax                    | 400    | `JSONSyntaxError`           | Malformed JSON in request body          |
| 9 | Generic HTTP Error             | varies | from error                  | Custom throw via http-errors package    |
|10 | Generic Fallback               | 500    | `InternalServerError`       | Any other unhandled JavaScript error    |

---

## 📌 Full Source Code

```typescript
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { config } from "../config";

// ─── Error Response Shape ────────────────────────────────────────────────────
interface IErrorResponse {
    statusCode: number;
    success: false;
    errorName: string;
    errorMessage: string;
    errorDetails?: Record<string, unknown> | null;
    errorPath: string;
    errorMethod: string;
    errorStack: string | null;
    timestamp: string;
}

// ─── Meta Extraction Helpers (handles both standard Prisma & driver adapter) ──

/**
 * P2002 - Unique constraint:
 *  Standard Prisma : meta.target  -> string[]  e.g. ["email"]
 *  Driver adapter  : meta.driverAdapterError.cause.constraint.fields -> string[]
 *                  : meta.driverAdapterError.cause.constraint.index  -> string  e.g. "users_email_key"
 */
const extractUniqueFields = (meta: Record<string, unknown> | undefined): string => {
    if (!meta) return "unknown";

    // Standard Prisma path
    if (Array.isArray(meta.target) && meta.target.length > 0) {
        return (meta.target as string[]).join(", ");
    }

    // Driver adapter path
    const cause = (meta.driverAdapterError as any)?.cause;
    if (cause) {
        if (Array.isArray(cause.constraint?.fields) && cause.constraint.fields.length > 0) {
            return (cause.constraint.fields as string[]).join(", ");
        }
        if (typeof cause.constraint?.index === "string") {
            const indexName: string = cause.constraint.index;
            const parts = indexName.split("_");
            if (parts.length >= 3) {
                const fieldPart = parts.slice(1, -1).join("_");
                return fieldPart || indexName;
            }
            return indexName;
        }
        if (typeof cause.originalMessage === "string") {
            return cause.originalMessage;
        }
    }

    return "unknown";
};

/**
 * P2003 - Foreign key constraint:
 *  Standard Prisma : meta.field_name -> string
 *  Driver adapter  : meta.driverAdapterError.cause.constraint.fields -> string[]
 */
const extractForeignKeyField = (meta: Record<string, unknown> | undefined): string => {
    if (!meta) return "unknown";

    // Standard Prisma path
    if (typeof meta.field_name === "string" && meta.field_name) {
        return meta.field_name;
    }

    // Driver adapter path
    const cause = (meta.driverAdapterError as any)?.cause;
    if (cause) {
        if (Array.isArray(cause.constraint?.fields) && cause.constraint.fields.length > 0) {
            return (cause.constraint.fields as string[]).join(", ");
        }
        if (typeof cause.constraint?.index === "string") {
            return cause.constraint.index;
        }
        if (typeof cause.originalMessage === "string") {
            return cause.originalMessage;
        }
    }

    return "unknown";
};

// ─── Global Error Handler ────────────────────────────────────────────────────
export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const isProduction = config.node_env === "production";

    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string = err.message || "Something went wrong";
    let errorName: string = err.name || "InternalServerError";
    let errorDetails: Record<string, unknown> | null = null;

    // ── 1. Prisma Validation Error (missing/wrong fields) ──────────────────
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorName = "PrismaValidationError";
        errorMessage = "Invalid field type or missing required fields";

    // ── 2. Prisma Known Request Error (DB constraint violations, etc.) ──────
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        errorName = "PrismaKnownRequestError";

        switch (err.code) {
            case "P2000":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "Input value is too long for this field";
                break;
            case "P2001":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = "Record does not exist";
                break;
            case "P2002":
                statusCode = httpStatus.CONFLICT;
                errorMessage = `Unique constraint violation on field(s): ${extractUniqueFields(err.meta as Record<string, unknown> | undefined)}`;
                errorDetails = { prismaCode: err.code, meta: err.meta };
                break;
            case "P2003":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Foreign key constraint failed on field: ${extractForeignKeyField(err.meta as Record<string, unknown> | undefined)}`;
                errorDetails = { prismaCode: err.code, meta: err.meta };
                break;
            case "P2004":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "A database constraint was violated";
                break;
            case "P2005":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Invalid value stored in database for field: ${err.meta?.field_name ?? "unknown"}`;
                break;
            case "P2006":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Provided value is not valid for field: ${err.meta?.field_name ?? "unknown"}`;
                break;
            case "P2011":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Null constraint violation on field: ${err.meta?.constraint ?? "unknown"}`;
                break;
            case "P2025":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = (err.meta?.cause as string | undefined) ?? "Required record not found";
                errorDetails = { prismaCode: err.code, meta: err.meta };
                break;
            default:
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Database request error [${err.code}]`;
                errorDetails = { prismaCode: err.code, meta: err.meta };
        }

    // ── 3. Prisma Initialization Error (connection/auth issues) ────────────
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        errorName = "PrismaInitializationError";

        switch (err.errorCode) {
            case "P1000":
                statusCode = httpStatus.UNAUTHORIZED;
                errorMessage = "Database authentication failed. Please check credentials";
                break;
            case "P1001":
                statusCode = httpStatus.SERVICE_UNAVAILABLE;
                errorMessage = "Cannot reach the database server";
                break;
            case "P1002":
                statusCode = httpStatus.REQUEST_TIMEOUT;
                errorMessage = "Database server connection timed out";
                break;
            case "P1003":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = "Database does not exist";
                break;
            case "P1008":
                statusCode = httpStatus.REQUEST_TIMEOUT;
                errorMessage = "Database operation timed out";
                break;
            case "P1009":
                statusCode = httpStatus.CONFLICT;
                errorMessage = "Database already exists";
                break;
            case "P1010":
                statusCode = httpStatus.FORBIDDEN;
                errorMessage = "Database user was denied access";
                break;
            default:
                statusCode = httpStatus.INTERNAL_SERVER_ERROR;
                errorMessage = "Database initialization failed";
        }

    // ── 4. Prisma Unknown Request Error ────────────────────────────────────
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorName = "PrismaUnknownRequestError";
        errorMessage = "An unknown error occurred during the database query";

    // ── 5. Prisma Rust Panic Error ─────────────────────────────────────────
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorName = "PrismaRustPanicError";
        errorMessage = "A critical internal database engine error occurred";

    // ── 6. Zod Validation Error ─────────────────────────────────────────────
    } else if (err?.name === "ZodError") {
        statusCode = httpStatus.UNPROCESSABLE_ENTITY;
        errorName = "ZodValidationError";
        errorMessage = "Request validation failed";
        errorDetails = { issues: err.errors };

    // ── 7. JWT Errors ───────────────────────────────────────────────────────
    } else if (err?.name === "JsonWebTokenError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorName = "JsonWebTokenError";  
        errorMessage = "Invalid or malformed token";
    } else if (err?.name === "TokenExpiredError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorName = "TokenExpiredError";
        errorMessage = "Your session has expired. Please log in again";
    } else if (err?.name === "NotBeforeError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorName = "NotBeforeError";
        errorMessage = "Token is not yet active";

    // ── 8. JSON Syntax Error (malformed request body) ───────────────────────
    } else if (err instanceof SyntaxError && "body" in err) {
        statusCode = httpStatus.BAD_REQUEST;
        errorName = "JSONSyntaxError";
        errorMessage = "Malformed JSON in request body";

    // ── 9. Generic HTTP Errors (e.g. from http-errors package) ─────────────
    } else if (err?.statusCode || err?.status) {
        statusCode = err.statusCode ?? err.status ?? httpStatus.INTERNAL_SERVER_ERROR;
        errorName = err.name ?? "HttpError";
        errorMessage = err.message ?? "An HTTP error occurred";

    // ── 10. Generic / Unhandled Error ──────────────────────────────────────
    } else if (err instanceof Error) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorName = err.name || "InternalServerError";
        errorMessage = err.message || "An unexpected error occurred";
    }

    // ── Build Response ──────────────────────────────────────────────────────
    const errorResponse: IErrorResponse = {
        statusCode,
        success: false,
        errorName,
        errorMessage,
        errorDetails: errorDetails ?? null,
        errorPath: req.originalUrl,
        errorMethod: req.method,
        errorStack: isProduction ? null : (err?.stack ?? null),
        timestamp: new Date().toISOString(),
    };

    // Log error in development for debugging
    if (!isProduction) {
        console.error("[GlobalErrorHandler]", {
            errorName,
            errorMessage,
            statusCode,
            path: req.originalUrl,
            method: req.method,
            stack: err?.stack,
        });
    }

    res.status(statusCode).json(errorResponse);
};
```
