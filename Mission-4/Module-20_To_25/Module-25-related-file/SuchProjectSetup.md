# 🚀 Complete Project Setup Guide: Enterprise Node.js, Express, TypeScript & Prisma ORM

> **The Definitive Scaffolding Blueprint for Modern Backend Projects**  
> Learn how to set up a brand-new backend project from scratch using the exact architecture, patterns, and conventions of this production-grade repository (`catchAsync`, `sendResponse`, Prisma multi-file schemas, role-based auth, and Stripe integration).  
> Includes **complete step-by-step instructions for Local CLI, Remote Listeners, Remote CLI, and testing both Development & Production webhook systems**.

---

## 📑 Table of Contents

1. [Stack Overview & Architectural Philosophy](#1-stack-overview--architectural-philosophy)
2. [Master Folder Structure](#2-master-folder-structure)
3. [Phase 1: Project Initialization & Package Installation](#phase-1-project-initialization--package-installation)
4. [Phase 2: TypeScript & Build Configuration](#phase-2-typescript--build-configuration)
5. [Phase 3: Directory Structure Scaffolding](#phase-3-directory-structure-scaffolding)
6. [Phase 4: Environment Variables & Config Layer](#phase-4-environment-variables--config-layer)
7. [Phase 5: Prisma ORM & Database Setup (Multi-File Schema)](#phase-5-prisma-orm--database-setup-multi-file-schema)
8. [Phase 6: Singletons Setup (Prisma & Stripe)](#phase-6-singletons-setup-prisma--stripe)
9. [Phase 7: Core Utilities (`catchAsync`, `sendResponse`, `jwt`)](#phase-7-core-utilities-catchasync-sendresponse-jwt)
10. [Phase 8: Production Middlewares (`auth`, `notFound`, `globalErrorHandler`)](#phase-8-production-middlewares-auth-notfound-globalerrorhandler)
11. [Phase 9: Building Feature Modules (User & Payment Domains)](#phase-9-building-feature-modules-user--payment-domains)
12. [Phase 10: Complete Webhook System: Codebase Handling for Dev & Prod](#phase-10-complete-webhook-system-codebase-handling-for-dev--prod)
13. [Phase 11: Remote CLI, Remote Listener & Production Ingress](#phase-11-remote-cli-remote-listener--production-ingress)
14. [Phase 12: Express Application Assembly (`src/app.ts`)](#phase-12-express-application-assembly-srcappts)
15. [Phase 13: Server Bootstrap & Lifecycle (`src/server.ts`)](#phase-13-server-bootstrap--lifecycle-srcserverts)
16. [Phase 14: How to Test Both Development & Production Systems](#phase-14-how-to-test-both-development--production-systems)
17. [Phase 15: Production Best Practices & Common Setup Traps](#phase-15-production-best-practices--common-setup-traps)

---

## 1. Stack Overview & Architectural Philosophy

This architecture is optimized for **speed, maintainability, type safety, and scalability**:

| Technology | Purpose in Project |
| :--- | :--- |
| **Node.js + Express 5** | High-throughput, asynchronous HTTP REST API engine |
| **TypeScript (v5+/v7)** | End-to-end type safety, preventing runtime `undefined` bugs |
| **Prisma ORM (v7+)** | Modern type-safe database queries with PostgreSQL adapter (`@prisma/adapter-pg`) |
| **PostgreSQL** | ACID-compliant relational data storage |
| **JWT + Bcrypt.js** | Stateless authentication with hashed password security |
| **Stripe SDK** | Production-ready checkout, subscriptions, and raw webhook handling |
| **TSX** | Lightning-fast TypeScript development execution without manual compilation steps |

### Key Architectural Patterns
- **Layered Architecture:** Routes ➔ Controllers ➔ Services ➔ Database.
- **Zero-Boilerplate Async:** Controllers wrapped in `catchAsync` to avoid repetitive `try/catch` blocks.
- **Standardized API Envelope:** Every response formatted via `sendResponse` (`{ success, statusCode, message, data, meta }`).
- **Feature Modules:** Self-contained domains (`auth`, `user`, `post`, `subscription`, `payment`).
- **Universal Webhook Pipeline:** Identical codebase handles both local CLI events in Development and cloud dispatches in Production.

---

## 2. Master Folder Structure

Here is the exact file tree you will create:

```
my-backend-project/
├── prisma/
│   ├── migrations/                 # Automated database migration history
│   └── schema/                     # Multi-file Prisma schemas
│       ├── schema.prisma           # Datasource and Client Generator
│       ├── enums.prisma            # Global system enums (Role, Status, etc.)
│       ├── user.prisma             # User entity model
│       ├── subscription.prisma     # Subscription model
│       └── webhookLog.prisma       # Idempotency log table
├── src/
│   ├── config/
│   │   └── index.ts                # Centralized environment variable validator
│   ├── lib/
│   │   ├── prisma.ts               # PrismaClient database singleton
│   │   └── stripe.ts               # Stripe API singleton
│   ├── middlewares/
│   │   ├── auth.ts                 # Role-based JWT authentication guard
│   │   ├── globalErrorHandler.ts   # Centralized error handler
│   │   └── notFound.ts             # 404 route-not-found handler
│   ├── utils/
│   │   ├── catchAsync.ts           # Async wrapper eliminating try/catch
│   │   ├── sendResponse.ts         # Unified JSON response wrapper
│   │   └── jwt.ts                  # JWT token creation and verification
│   ├── modules/
│   │   ├── user/                   # User Domain Module
│   │   │   ├── user.interface.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.route.ts
│   │   └── payment/                # Payment & Webhook Domain Module
│   │       ├── payment.service.ts
│   │       ├── payment.controller.ts
│   │       └── payment.route.ts
│   ├── app.ts                      # Express application setup & middleware chain
│   └── server.ts                   # Process bootstrap & port listener
├── .env                            # Secret environment variables (git-ignored)
├── .env.example                    # Public template for environment variables
├── .gitignore                      # Git ignored files & folders
├── package.json                    # Project dependencies and npm scripts
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## 3. Phase 1: Project Initialization & Package Installation

Open your terminal and run the following commands step-by-step:

### Step 1: Create and Initialize Project Folder
```bash
mkdir my-backend-project
cd my-backend-project
npm init -y
```

### Step 2: Enable ES Modules in `package.json`
Open `package.json` and ensure `"type": "module"` is configured:
```json
{
  "name": "my-backend-project",
  "version": "1.0.0",
  "type": "module",
  "main": "server.ts"
}
```

### Step 3: Install Production Dependencies
```bash
npm install express dotenv cors cookie-parser http-status jsonwebtoken bcryptjs pg @prisma/client @prisma/adapter-pg stripe
```

### Step 4: Install Development Dependencies
```bash
npm install -D typescript tsx @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/pg prisma
```

---

## 4. Phase 2: TypeScript & Build Configuration

Create `tsconfig.json` in the root of your project:

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "strict": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### Configure NPM Scripts in `package.json`
Add these execution scripts to your `package.json`:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "stripe:listen": "stripe listen --forward-to localhost:5000/api/payment/webhook"
}
```

---

## 5. Phase 3: Directory Structure Scaffolding

Run these commands in terminal to instantly create all directories:

### For Windows (PowerShell):
```powershell
New-Item -ItemType Directory -Force -Path `
  "prisma/schema", `
  "src/config", `
  "src/lib", `
  "src/middlewares", `
  "src/utils", `
  "src/modules/user", `
  "src/modules/payment"
```

### For macOS / Linux (Bash):
```bash
mkdir -p prisma/schema src/config src/lib src/middlewares src/utils src/modules/user src/modules/payment
```

---

## 6. Phase 4: Environment Variables & Config Layer

### Step 1: Create `.gitignore`
Create `.gitignore` in the project root:
```gitignore
node_modules
dist
.env
generated
.idea
.vscode
.claude
.windsurf
```

### Step 2: Create `.env.example` (Committed to Git)
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/my_database?schema=public"
APP_URL="http://localhost:3000"
NODE_ENV="development"
BCRYPT_SALT_ROUNDS=12

# JWT Secrets
JWT_ACCESS_SECRET="your_jwt_access_secret_here"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_here"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe Secrets
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret_here"
STRIPE_WEBHOOK_SECRET_ROLLING=""
STRIPE_PRODUCT_PRICE_ID="your_stripe_product_price_id_here"
```

### Step 3: Create `.env` (Your Local Secrets)
Copy `.env.example` to `.env` and fill in your real local database credentials:
```bash
cp .env.example .env
```

### Step 4: Create Central Config Layer (`src/config/index.ts`)
```ts
// src/config/index.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL!,
    node_env: process.env.NODE_ENV || "development",
    app_url: process.env.APP_URL || "http://localhost:3000",
    bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    stripe_webhook_secret_rolling: process.env.STRIPE_WEBHOOK_SECRET_ROLLING || "",
    stripe_product_price_id: process.env.STRIPE_PRODUCT_PRICE_ID!,
};
```

---

## 7. Phase 5: Prisma ORM & Database Setup (Multi-File Schema)

This project uses Prisma's multi-file schema feature where separate `.prisma` files exist inside `prisma/schema/`.

### Step 1: Datasource & Client Setup (`prisma/schema/schema.prisma`)
```prisma
// prisma/schema/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

### Step 2: Global Enums (`prisma/schema/enums.prisma`)
```prisma
// prisma/schema/enums.prisma
enum Role {
  USER
  ADMIN
}

enum ActiveStatus {
  ACTIVE
  BLOCKED
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAST_DUE
}
```

### Step 3: User Entity Model (`prisma/schema/user.prisma`)
```prisma
// prisma/schema/user.prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  password     String
  role         Role          @default(USER)
  status       ActiveStatus  @default(ACTIVE)

  subscription Subscription?

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@map("users")
}
```

### Step 4: Subscription Entity Model (`prisma/schema/subscription.prisma`)
```prisma
// prisma/schema/subscription.prisma
model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  currentPeriodEnd     DateTime
  status               SubscriptionStatus @default(ACTIVE)

  stripeCustomerId     String             @unique
  stripeSubscriptionId String             @unique

  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@index([userId])
  @@index([stripeSubscriptionId])
  @@map("subscriptions")
}
```

### Step 5: Webhook Idempotency Log (`prisma/schema/webhookLog.prisma`)
```prisma
// prisma/schema/webhookLog.prisma
model WebhookLog {
  id          String   @id @default(uuid())
  eventId     String   @unique // "evt_xxx" from Stripe
  eventType   String
  processedAt DateTime @default(now())

  @@index([eventId])
  @@map("webhook_logs")
}
```

### Step 6: Run Initial Database Migration
Make sure PostgreSQL is running locally, then execute:
```bash
npx prisma migrate dev --name init_schema
```
*(This creates your database tables and generates the typed Prisma Client into `generated/prisma`)*

---

## 8. Phase 6: Singletons Setup (Prisma & Stripe)

### Database Singleton (`src/lib/prisma.ts`)
```ts
// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
```

### Stripe Singleton (`src/lib/stripe.ts`)
```ts
// src/lib/stripe.ts
import Stripe from "stripe";
import { config } from "../config";

export const stripe = new Stripe(config.stripe_secret_key, {
    apiVersion: "2025-02-24.acacia" as any,
    typescript: true,
});
```

---

## 9. Phase 7: Core Utilities (`catchAsync`, `sendResponse`, `jwt`)

### 1. `src/utils/catchAsync.ts`
Eliminates repetitive `try / catch` blocks in your controllers.
```ts
// src/utils/catchAsync.ts
import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: any) {
            next(error); // Passes error straight to globalErrorHandler
        }
    };
};
```

### 2. `src/utils/sendResponse.ts`
Standardizes all JSON API responses.
```ts
// src/utils/sendResponse.ts
import { Response } from "express";

type TMeta = {
    page: number;
    limit: number;
    total: number;
};

type TResponseData<T> = {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    meta?: TMeta;
};

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
    res.status(data.statusCode).json(data);
};
```

### 3. `src/utils/jwt.ts`
Handles JWT token generation and verification.
```ts
// src/utils/jwt.ts
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions["expiresIn"]) => {
    return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token: string, secret: string) => {
    try {
        const verifiedToken = jwt.verify(token, secret);
        return {
            success: true,
            data: verifiedToken as JwtPayload,
        };
    } catch (error: any) {
        return {
            success: false,
            originalError: error,
        };
    }
};

export const jwtUtils = {
    createToken,
    verifyToken,
};
```

---

## 10. Phase 8: Production Middlewares (`auth`, `notFound`, `globalErrorHandler`)

### 1. Authentication & Role Guard (`src/middlewares/auth.ts`)
```ts
// src/middlewares/auth.ts
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { config } from "../config";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
            };
        }
    }
}

export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.accessToken 
            || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.headers.authorization);

        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "You are not logged in. Please log in to access this resource.",
            });
        }

        const verified = jwtUtils.verifyToken(token, config.jwt_access_secret);
        if (!verified.success) {
            throw verified.originalError;
        }

        const decodedUser = verified.data as { id: string; email: string; role: Role };

        if (requiredRoles.length > 0 && !requiredRoles.includes(decodedUser.role)) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                message: "You do not have permission to access this resource.",
            });
        }

        req.user = decodedUser;
        next();
    });
};
```

### 2. 404 Not Found Handler (`src/middlewares/notFound.ts`)
```ts
// src/middlewares/notFound.ts
import { Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Route Not Found",
        error: {
            code: httpStatus.NOT_FOUND,
            description: `The requested endpoint ${req.originalUrl} does not exist.`,
        },
    });
};
```

### 3. Global Centralized Error Handler (`src/middlewares/globalErrorHandler.ts`)
```ts
// src/middlewares/globalErrorHandler.ts
import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { config } from "../config";

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || "Internal Server Error";

    if (err.name === "TokenExpiredError") {
        statusCode = httpStatus.UNAUTHORIZED;
        message = "Session token expired. Please log in again.";
    }

    return res.status(statusCode).json({
        success: false,
        message,
        error: config.node_env === "development" ? err : undefined,
        stack: config.node_env === "development" ? err.stack : undefined,
    });
};
```

---

## 11. Phase 9: Building Feature Modules (User & Payment Domains)

### 1. The User Module (`src/modules/user/`)

#### A. Interface (`src/modules/user/user.interface.ts`)
```ts
export type TCreateUserPayload = {
    name: string;
    email: string;
    password: string;
};
```

#### B. Service (`src/modules/user/user.service.ts`)
```ts
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { config } from "../../config";
import { TCreateUserPayload } from "./user.interface";

const createUser = async (payload: TCreateUserPayload) => {
    const hashedPassword = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds);

    const user = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    return user;
};

const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
};

export const userServices = {
    createUser,
    getAllUsers,
};
```

#### C. Controller (`src/modules/user/user.controller.ts`)
```ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const result = await userServices.createUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await userServices.getAllUsers();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
});

export const userController = {
    createUser,
    getAllUsers,
};
```

#### D. Route (`src/modules/user/user.route.ts`)
```ts
import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.createUser);
router.get("/", auth(Role.ADMIN), userController.getAllUsers);

export const userRoutes = router;
```

---

## 12. Phase 10: Complete Webhook System: Codebase Handling for Dev & Prod

This service handles both **Local CLI** in Development and **Cloud Dispatch** in Production without requiring code modifications:

### 1. `src/modules/payment/payment.service.ts`
```ts
// src/modules/payment/payment.service.ts
import Stripe from "stripe";
import { config } from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

/**
 * 1. Create Subscription Checkout Session
 */
const createCheckoutSession = async (userId: string) => {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
            where: { id: userId },
            include: { subscription: true }
        });

        let customerId = user.subscription?.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id }
            });
            customerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            allowed_payment_method_types: ["card"],
            line_items: [{ price: config.stripe_product_price_id, quantity: 1 }],
            success_url: `${config.app_url}/billing?success=true`,
            cancel_url: `${config.app_url}/billing?canceled=true`,
            metadata: { userId }
        });

        return { paymentUrl: session.url };
    });
};

/**
 * 2. Universal Webhook Handler (Supports Local CLI & Production Remote Listener)
 */
const handleWebhook = async (payload: Buffer, signature: string) => {
    let event: Stripe.Event;

    // A. Verify Signature with Zero-Downtime Secret Rotation Fallback
    try {
        event = stripe.webhooks.constructEvent(payload, signature, config.stripe_webhook_secret);
    } catch (primaryErr: any) {
        if (config.stripe_webhook_secret_rolling) {
            try {
                event = stripe.webhooks.constructEvent(payload, signature, config.stripe_webhook_secret_rolling);
            } catch (rollingErr: any) {
                throw new Error(`Webhook verification error: ${primaryErr.message}`);
            }
        } else {
            throw new Error(`Webhook verification error: ${primaryErr.message}`);
        }
    }

    // B. Production Idempotency Check
    const alreadyHandled = await prisma.webhookLog.findUnique({
        where: { eventId: event.id }
    });

    if (alreadyHandled) {
        console.log(`ℹ️ [Webhook] Duplicate event ${event.id} received. Skipping.`);
        return;
    }

    await prisma.webhookLog.create({
        data: { eventId: event.id, eventType: event.type }
    });

    // C. Event Dispatcher
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const stripeCustomerId = session.customer as string;
            const stripeSubscriptionId = session.subscription as string;

            if (userId && stripeCustomerId && stripeSubscriptionId) {
                const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                const currentPeriodEnd = new Date(sub.current_period_end * 1000);

                await prisma.subscription.upsert({
                    where: { userId },
                    update: { stripeCustomerId, stripeSubscriptionId, currentPeriodEnd, status: SubscriptionStatus.ACTIVE },
                    create: { userId, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd, status: SubscriptionStatus.ACTIVE },
                });
                console.log(`🎉 [Webhook] Subscription activated for user ${userId}`);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await prisma.subscription.updateMany({
                where: { stripeSubscriptionId: sub.id },
                data: { status: SubscriptionStatus.CANCELLED }
            });
            console.log(`🛑 [Webhook] Subscription ${sub.id} cancelled`);
            break;
        }

        default:
            console.log(`ℹ️ [Webhook] Unhandled event type: ${event.type}`);
    }
};

export const paymentServices = {
    createCheckoutSession,
    handleWebhook,
};
```

### 2. `src/modules/payment/payment.controller.ts`
```ts
// src/modules/payment/payment.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentServices } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await paymentServices.createCheckoutSession(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result,
    });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Missing stripe-signature header",
        });
    }

    await paymentServices.handleWebhook(payload, signature);

    // Fast HTTP 200 acknowledgement
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Webhook processed successfully",
        data: null,
    });
});

export const paymentController = {
    createCheckoutSession,
    handleWebhook,
};
```

### 3. `src/modules/payment/payment.route.ts`
```ts
// src/modules/payment/payment.route.ts
import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/checkout", auth(Role.USER, Role.ADMIN), paymentController.createCheckoutSession);
router.post("/webhook", paymentController.handleWebhook);

export const paymentRoutes = router;
```

---

## 13. Phase 11: Remote CLI, Remote Listener & Production Ingress

Understanding how webhooks travel into your system across different deployment stages:

```mermaid
flowchart TD
    subgraph STAGE_1["1. Local Dev Machine"]
        LocalCLI[Stripe CLI] --> |HTTP POST| LocalExpress[localhost:5000]
    end

    subgraph STAGE_2["2. Remote Staging Server"]
        RemoteCLI[Stripe CLI with --forward-to] --> |HTTPS POST| StagingServer[staging-api.yourdomain.com]
    end

    subgraph STAGE_3["3. Production Cloud"]
        StripeCloud[Stripe Webhook Dispatcher] --> |Direct HTTPS POST| ProdServer[api.yourdomain.com]
    end
```

### 1. Local Development (Local Stripe CLI)
- **Ingress:** `stripe listen --forward-to localhost:5000/api/payment/webhook`
- **Secret:** Generated in terminal (`whsec_test_...`), pasted into `.env`.

### 2. Remote Staging Forwarding (Remote CLI)
Forward webhooks to a staging cloud instance directly from your terminal:
```bash
stripe listen --forward-to https://staging-api.yourdomain.com/api/payment/webhook
```

### 3. Live Production Listener (Stripe Dashboard)
- **Never run CLI on production servers!**
- Register your public URL in **Stripe Dashboard ➔ Developers ➔ Webhooks**:
  ```
  https://api.yourdomain.com/api/payment/webhook
  ```
- Copy the persistent signing secret (`whsec_live_...`) into your cloud hosting environment variables.

---

## 14. Phase 12: Express Application Assembly (`src/app.ts`)

> [!IMPORTANT]
> **Webhook Middleware Rule:**  
> Mount Stripe Webhook routes with `express.raw({ type: "application/json" })` **before** standard `express.json()`. Otherwise, signature verification will fail!

```ts
// src/app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoutes } from "./modules/user/user.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

// 1. CORS Configuration
app.use(cors({
    origin: ["http://localhost:3000", "https://yourfrontend.com"],
    credentials: true,
}));

// 2. ⚠️ Mount Raw Webhook parser BEFORE express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// 3. Standard Body Parsers for normal routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4. Health Check Route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "API Server is running successfully!",
    });
});

// 5. Application Feature Routes
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);

// 6. 404 & Centralized Error Handlers (Always at the end)
app.use(notFound);
app.use(globalErrorHandler);

export default app;
```

---

## 15. Phase 13: Server Bootstrap & Lifecycle (`src/server.ts`)

```ts
// src/server.ts
import app from "./app";
import { prisma } from "./lib/prisma";
import { config } from "./config";

const PORT = config.port;

async function bootstrap() {
    try {
        // 1. Verify database connection before binding HTTP port
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        // 2. Start HTTP listener
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

bootstrap();
```

---

## 16. Phase 14: How to Test Both Development & Production Systems

### A. Testing the Development System (Local Machine)

#### 1. Instant Synthetic Trigger
Test if your Express webhook endpoint receives and verifies events:
```bash
# Terminal 1: Run your server
npm run dev

# Terminal 2: Run Stripe CLI listener
stripe listen --forward-to localhost:5000/api/payment/webhook

# Terminal 3: Trigger synthetic event
stripe trigger checkout.session.completed
```
**Expected Result:** Terminal 2 shows `[200] POST http://localhost:5000/api/payment/webhook`.

#### 2. End-to-End Browser Checkout Test
1. Call `POST http://localhost:5000/api/payment/checkout` with a valid JWT token.
2. Open the returned `paymentUrl` in your browser.
3. Pay using Stripe Test Card: `4242 4242 4242 4242` (Exp: future date, CVC: `123`).
4. Watch the webhook log in Terminal 2.
5. Run `npx prisma studio` and confirm the `subscriptions` table has updated to `ACTIVE`.

#### 3. Idempotency Duplicate Test
Replay the same event payload twice. Confirm your server logs `Duplicate event received. Skipping` and returns `200 OK` without creating duplicate records.

---

### B. Testing the Production System (Live Cloud Server)

#### 1. Pre-Flight Reachability Test (Stripe Dashboard)
1. Open **Stripe Dashboard ➔ Developers ➔ Webhooks**.
2. Click your live endpoint (`https://api.yourdomain.com/api/payment/webhook`).
3. Click **"Send test event"** ➔ Select `checkout.session.completed`.
4. Click **"Send test event"**.
5. Confirm the response shows **`200 OK` (Green)** in `< 300ms`.

#### 2. Live Low-Value Purchase & Refund ($1.00 Test)
1. Create a $1.00 product in your live Stripe account.
2. Complete a live purchase on your production site using a real debit/credit card.
3. Confirm your user account status unlocks in your live PostgreSQL database.
4. Issue an immediate refund in Stripe Dashboard ➔ Payments ➔ Refund.
5. Confirm your webhook receives `charge.refunded` and updates the order status.

#### 3. Downtime Recovery & Manual Redelivery
1. In Stripe Dashboard ➔ Developers ➔ Webhooks ➔ Select Endpoint ➔ Event History.
2. Click any event ➔ Click **"Resend"**.
3. Confirm in production logs (`pm2 logs` / CloudWatch) that your server acknowledges the redelivery cleanly.

---

## 17. Phase 15: Production Best Practices & Common Setup Traps

| # | Common Setup Trap | Why It Happens | How to Prevent It |
| :-: | :--- | :--- | :--- |
| **1** | **`Cannot find module 'generated/prisma'`** | Running server before generating Prisma client. | Always run `npx prisma generate` after modifying `prisma/schema/*.prisma`. |
| **2** | **Webhook Signature Verification Failed** | `express.json()` ran before `express.raw()`. | Keep `express.raw({ type: "application/json" })` at the top of `src/app.ts`. |
| **3** | **Module Import Extension Errors** | Mixing CommonJS and ESM imports. | Ensure `"type": "module"` in `package.json` and `"moduleResolution": "bundler"` in `tsconfig.json`. |
| **4** | **Database Connection Exhaustion** | Creating `new PrismaClient()` inside controllers. | Always import the single instance from `src/lib/prisma.ts`. |
| **5** | **Unhandled Promise Rejections** | Forgetting to wrap controllers in `catchAsync`. | Wrap every controller function: `const fn = catchAsync(async (req, res) => {...})`. |
| **6** | **Running `stripe listen` in Production** | Misunderstanding CLI vs Dashboard listener. | Never run the CLI on live servers; configure Webhooks via Stripe Dashboard. |

---

*Authored as the standard project creation template for Node.js, Express, TypeScript, and Prisma ORM web backends.*
