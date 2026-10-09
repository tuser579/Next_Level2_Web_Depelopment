# 🏋️ GearUp: Production Architecture, Prisma Schemas, API Endpoints, Demo Seeding, Testing & Stripe Payment Guide

> **Repository Master Specification**  
> Complete end-to-end production guide for the **GearUp Sports & Outdoor Equipment Rental Backend API**.  
> Synthesizing **`2-GearUp-Project-Feature.md`** and **`Full_Project_SetUp.md`** into an enterprise-grade blueprint with zero pseudocode.

---

## 📑 Table of Contents

1. [A-to-Z Analysis: Feature Requirements & Architecture Blueprint](#1-a-to-z-analysis-feature-requirements--architecture-blueprint)
2. [Master Project Folder Structure & Production Scaffolding](#2-master-project-folder-structure--production-scaffolding)
   - [2.1 Complete Enterprise Directory Tree](#21-complete-enterprise-directory-tree)
   - [2.2 Automated Scaffolding Commands (PowerShell & Bash)](#22-automated-scaffolding-commands-powershell--bash)
   - [2.3 Package Dependencies & npm Scripts (`package.json`)](#23-package-dependencies--npm-scripts-packagejson)
   - [2.4 TypeScript Configuration (`tsconfig.json`)](#24-typescript-configuration-tsconfigjson)
   - [2.5 Centralized Environment Config (`src/config/index.ts` & `.env.example`)](#25-centralized-environment-config-srcconfigindexts--envexample)
   - [2.6 Architectural Roles & Layer Responsibilities](#26-architectural-roles--layer-responsibilities)
3. [Part 1: Prisma Model Schema (Production Multi-File & Consolidated)](#part-1-prisma-model-schema-production-multi-file--consolidated)
   - [Global Enums (`prisma/schema/enums.prisma`)](#1-global-enums-prismaschemaenumsprisma)
   - [User Entity (`prisma/schema/user.prisma`)](#2-user-entity-prismaschemauserprisma)
   - [Category Entity (`prisma/schema/category.prisma`)](#3-category-entity-prismaschemacategoryprisma)
   - [Gear Item Entity (`prisma/schema/gearItem.prisma`)](#4-gear-item-entity-prismaschemagearitemprisma)
   - [Rental Order Entities (`prisma/schema/rentalOrder.prisma`)](#5-rental-order-entities-prismaschemarentalorderprisma)
   - [Payment Entity (`prisma/schema/payment.prisma`)](#6-payment-entity-prismaschemapaymentprisma)
   - [Review Entity (`prisma/schema/review.prisma`)](#7-review-entity-prismaschemareviewprisma)
   - [Webhook Idempotency Entity (`prisma/schema/webhookLog.prisma`)](#8-webhook-idempotency-entity-prismaschemawebhooklogprisma)
   - [Consolidated Single-File `schema.prisma`](#9-consolidated-single-file-schemaprisma)
4. [Part 2: API Endpoints Catalog & Step-by-Step Implementation](#part-2-api-endpoints-catalog--step-by-step-implementation)
   - [Core Utilities & Shared Middlewares](#core-utilities--shared-middlewares)
   - [Module 1: Authentication & Profile (`/api/auth`)](#module-1-authentication--profile-apiauth)
   - [Module 2: User Administration (`/api/admin/users`)](#module-2-user-administration-apiadminusers)
   - [Module 3: Categories (`/api/categories`)](#module-3-categories-apicategories)
   - [Module 4: Gear Inventory & Public Catalog (`/api/gear` & `/api/provider/gear`)](#module-4-gear-inventory--public-catalog-apigear--apiprovidergear)
   - [Module 5: Rental Orders (`/api/rentals`, `/api/provider/orders`, `/api/admin/rentals`)](#module-5-rental-orders-apirentals-apiproviderorders-apiadminrentals)
   - [Module 6: Reviews & Ratings (`/api/reviews`)](#module-6-reviews--ratings-apireviews)
5. [Part 3: Production Demo Data Seeding (`prisma/seed.ts`)](#part-3-production-demo-data-seeding-prismaseedts)
   - [Complete Seed Script](#complete-seed-script-prismaseedts)
   - [Configuring and Executing the Seed](#configuring-and-executing-the-seed)
6. [Part 4: API Endpoint Testing Master Guide & Test Suite](#part-4-api-endpoint-testing-master-guide--test-suite)
   - [Sequential Execution Flow](#sequential-execution-flow)
   - [Detailed Test Matrix with Request Bodies & Expected Responses](#detailed-test-matrix-with-request-bodies--expected-responses)
   - [Negative & Role Guard Security Tests](#negative--role-guard-security-tests)
7. [Part 5: Production Stripe Payment Implementation & Webhook Architecture](#part-5-production-stripe-payment-implementation--webhook-architecture)
   - [5.1 Architecture & Ingress Flow (Local CLI vs. Production Cloud)](#51-architecture--ingress-flow-local-cli-vs-production-cloud)
   - [5.2 Codebase Implementation (`Full_Project_SetUp.md` Pattern)](#52-codebase-implementation-full_project_setupmd-pattern)
     - [Stripe Singleton (`src/lib/stripe.ts`)](#1-stripe-singleton-srclibstripets)
     - [Payment Domain Types (`src/modules/payment/payment.interface.ts`)](#2-payment-domain-types-srcmodulespaymentpaymentinterfacets)
     - [Payment Service (`src/modules/payment/payment.service.ts`)](#3-payment-service-srcmodulespaymentpaymentservicets)
     - [Payment Controller (`src/modules/payment/payment.controller.ts`)](#4-payment-controller-srcmodulespaymentpaymentcontrollerts)
     - [Payment Routes (`src/modules/payment/payment.route.ts`)](#5-payment-routes-srcmodulespaymentpaymentroutets)
     - [Express Application Assembly (`src/app.ts`)](#6-express-application-assembly-srcappts)
   - [5.3 Development Webhook System: Step-by-Step Setup & Testing](#53-development-webhook-system-step-by-step-setup--testing)
     - [Dev Step 1: Stripe CLI Installation & Login](#dev-step-1-stripe-cli-installation--login)
     - [Dev Step 2: Local Forwarding Listener Configuration](#dev-step-2-local-forwarding-listener-configuration)
     - [Dev Step 3: Test 1 - Instant Synthetic Trigger](#dev-step-3-test-1---instant-synthetic-trigger)
     - [Dev Step 4: Test 2 - Full End-to-End Browser Checkout Test](#dev-step-4-test-2---full-end-to-end-browser-checkout-test)
     - [Dev Step 5: Test 3 - Idempotency & Duplicate Replay Test](#dev-step-5-test-3---idempotency--duplicate-replay-test)
     - [Dev Step 6: Test 4 - Card Decline / Payment Failure Simulation](#dev-step-6-test-4---card-decline--payment-failure-simulation)
   - [5.4 Production Webhook System: Step-by-Step Deployment & Testing](#54-production-webhook-system-step-by-step-deployment--testing)
     - [Prod Step 1: Live Cloud Destination Ingress Registration](#prod-step-1-live-cloud-destination-ingress-registration)
     - [Prod Step 2: Environment Secrets & Zero-Downtime Rolling Key Setup](#prod-step-2-environment-secrets--zero-downtime-rolling-key-setup)
     - [Prod Step 3: Test 1 - Pre-Flight Reachability & Handshake Test](#prod-step-3-test-1---pre-flight-reachability--handshake-test)
     - [Prod Step 4: Test 2 - Live Low-Value Purchase & Refund ($1.00 Test)](#prod-step-4-test-2---live-low-value-purchase--refund-100-test)
     - [Prod Step 5: Test 3 - Zero-Downtime Secret Rotation Test](#prod-step-5-test-3---zero-downtime-secret-rotation-test)
     - [Prod Step 6: Test 4 - Downtime Recovery & Manual Redelivery Test](#prod-step-6-test-4---downtime-recovery--manual-redelivery-test)
   - [5.5 Production Best Practices & Common Setup Traps](#55-production-best-practices--common-setup-traps)

---

# 1. A-to-Z Analysis: Feature Requirements & Architecture Blueprint

### 1.1 Requirements Analysis (`2-GearUp-Project-Feature.md`)
The **GearUp** platform solves the friction of renting high-grade sports and outdoor equipment (e.g., trekking tents, road cycles, scuba gear, snowboards) by connecting equipment providers with sports enthusiasts.

1. **Role Separation**:
   - **Customer**: Registers freely, browses gear with multifaceted filters, books rentals for selected date ranges, pays online through Stripe, tracks status, returns gear, and submits verified reviews.
   - **Provider**: Registers with provider status, creates and manages gear catalog listings, controls unit inventory and maintenance status, receives customer rental orders, and transitions order states from confirmation to handoff (`PICKED_UP`) and return (`RETURNED`).
   - **Admin**: Moderates user accounts (`ACTIVE` / `BLOCKED`), oversees categories, audits all system orders, and monitors financial payment transactions.

2. **Rental Lifecycle Transitions**:
   $$\text{PLACED} \xrightarrow[\text{Provider confirms}]{\text{or auto-payment}} \text{CONFIRMED} \xrightarrow[\text{Customer pays via Stripe}]{\text{Webhook}} \text{PAID} \xrightarrow[\text{Pickup}]{\text{Provider}} \text{PICKED\_UP} \xrightarrow[\text{Equipment Returned}]{\text{Provider checks}} \text{RETURNED}$$
   - Cancellation is allowed when order is in `PLACED` or unpaid state.
   - Verified review creation is strictly restricted to orders with status `RETURNED`.

### 1.2 Architectural Framework (`Full_Project_SetUp.md`)
To build an enterprise, zero-compromise backend, we adhere to the strict conventions laid out in the setup guide:
- **Modular Layered Architecture**: Routes $\to$ Controllers $\to$ Services $\to$ Prisma Database Layer.
- **Zero-Boilerplate Error Handling**: Express controllers wrapped via `catchAsync` to avoid nested `try/catch`.
- **Standardized Response Envelope**:
  - Success: `{ success: true, statusCode: 200, message: "...", data: {...}, meta?: {...} }`
  - Error: `{ success: false, message: "...", errorDetails: {...}, stack?: "..." }`
- **Security & Session Tokens**: Passwords hashed with `bcryptjs` (cost factor: 12), dual-token JWT flow (short-lived access token, long-lived refresh token), role-based middleware guards (`auth(Role.CUSTOMER, ...)`).
- **Universal Stripe Webhook Pipeline**: Raw body parsing (`express.raw({ type: "application/json" })`) mounted prior to `express.json()`, cryptographic signature verification with rolling secret fallback, and database-level event deduplication (`WebhookLog`).

---

# 2. Master Project Folder Structure & Production Scaffolding

This project layout strictly follows the **`Full_Project_SetUp.md`** architecture, tailored specifically to the **GearUp** sports rental domain.

### 2.1 Complete Enterprise Directory Tree

```
gearup-backend/
├── prisma/
│   ├── migrations/                 # Automated database migration history
│   ├── seed.ts                     # Production database seed script
│   └── schema/                     # Multi-file Prisma schemas
│       ├── schema.prisma           # Datasource and Client Generator
│       ├── enums.prisma            # Global system enums (Role, UserStatus, ItemCondition, etc.)
│       ├── user.prisma             # User entity model (Customer, Provider, Admin)
│       ├── category.prisma         # Sports gear categories
│       ├── gearItem.prisma         # Gear item model (inventory, pricing, specs)
│       ├── rentalOrder.prisma      # Rental order & order items model
│       ├── payment.prisma          # Payment transactions & Stripe session tracking
│       ├── review.prisma           # Customer reviews & ratings
│       └── webhookLog.prisma       # Stripe webhook idempotency log table
├── src/
│   ├── config/
│   │   └── index.ts                # Centralized environment variable config & validator
│   ├── lib/
│   │   ├── prisma.ts               # PrismaClient database singleton
│   │   └── stripe.ts               # Stripe SDK singleton
│   ├── middlewares/
│   │   ├── auth.ts                 # Role-based JWT authentication & role guard
│   │   ├── globalErrorHandler.ts   # Centralized error handler with formatted JSON
│   │   └── notFound.ts             # 404 route-not-found handler
│   ├── utils/
│   │   ├── catchAsync.ts           # Async wrapper eliminating try/catch
│   │   ├── sendResponse.ts         # Standardized API response envelope wrapper
│   │   └── jwt.ts                  # JWT token creation & verification utilities
│   ├── modules/
│   │   ├── auth/                   # Authentication & user profile module
│   │   │   ├── auth.interface.ts   # TypeScript DTOs & payloads
│   │   │   ├── auth.service.ts     # Password hashing, JWT signing, profile queries
│   │   │   ├── auth.controller.ts  # Express request handlers with catchAsync
│   │   │   └── auth.route.ts       # Public & protected route definitions
│   │   ├── admin/                  # Admin governance module
│   │   │   ├── admin.service.ts    # User moderation, ban/activate, global audits
│   │   │   ├── admin.controller.ts # Admin controllers
│   │   │   └── admin.route.ts      # Protected routes (auth(Role.ADMIN))
│   │   ├── category/               # Category module
│   │   │   ├── category.service.ts # Category CRUD & gear item count aggregations
│   │   │   ├── category.controller.ts
│   │   │   └── category.route.ts
│   │   ├── gear/                   # Gear catalog & inventory module (Public + Provider)
│   │   │   ├── gear.interface.ts   # Gear filters, create/update DTOs
│   │   │   ├── gear.service.ts     # Multifaceted search, pagination, provider inventory
│   │   │   ├── gear.controller.ts
│   │   │   └── gear.route.ts
│   │   ├── rental/                 # Rental order lifecycle module
│   │   │   ├── rental.interface.ts # Order creation, duration calculation interfaces
│   │   │   ├── rental.service.ts   # Order placement, status transitions, stock restoration
│   │   │   ├── rental.controller.ts
│   │   │   └── rental.route.ts
│   │   ├── payment/                # Payment & Stripe webhook module
│   │   │   ├── payment.service.ts  # Checkout session generation, raw webhook verification
│   │   │   ├── payment.controller.ts
│   │   │   └── payment.route.ts
│   │   └── review/                 # Reviews & ratings module
│   │       ├── review.service.ts   # Verified review submission, gear rating queries
│   │       ├── review.controller.ts
│   │       └── review.route.ts
│   ├── app.ts                      # Express application assembly (raw webhook before express.json)
│   └── server.ts                   # Database connection verify & HTTP bootstrap
├── .env                            # Secret environment variables (git-ignored)
├── .env.example                    # Template environment variables
├── .gitignore                      # Git ignored files & folders
├── package.json                    # Project metadata, dependencies & scripts
└── tsconfig.json                   # TypeScript compiler configuration (ESM, strict)
```

---

### 2.2 Automated Scaffolding Commands (PowerShell & Bash)

#### For Windows (PowerShell):
```powershell
New-Item -ItemType Directory -Force -Path `
  "prisma/schema", `
  "src/config", `
  "src/lib", `
  "src/middlewares", `
  "src/utils", `
  "src/modules/auth", `
  "src/modules/admin", `
  "src/modules/category", `
  "src/modules/gear", `
  "src/modules/rental", `
  "src/modules/payment", `
  "src/modules/review"
```

#### For macOS / Linux (Bash):
```bash
mkdir -p prisma/schema src/config src/lib src/middlewares src/utils \
  src/modules/auth src/modules/admin src/modules/category src/modules/gear \
  src/modules/rental src/modules/payment src/modules/review
```

---

### 2.3 Package Dependencies & npm Scripts (`package.json`)

Ensure `"type": "module"` is configured to enforce modern ECMAScript Modules (ESM).

#### Install Dependencies:
```bash
# Production Dependencies
npm install express dotenv cors cookie-parser http-status jsonwebtoken bcryptjs pg @prisma/client @prisma/adapter-pg stripe

# Development Dependencies
npm install -D typescript tsx @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/pg prisma
```

#### `package.json` Configuration:
```json
{
  "name": "gearup-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.ts",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "stripe:listen": "stripe listen --forward-to localhost:5000/api/payments/confirm"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

### 2.4 TypeScript Configuration (`tsconfig.json`)

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
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 2.5 Centralized Environment Config (`src/config/index.ts` & `.env.example`)

#### `.env.example`
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/gearup_db?schema=public"
APP_URL="http://localhost:3000"
NODE_ENV="development"
BCRYPT_SALT_ROUNDS=12

# JWT Authentication Secrets
JWT_ACCESS_SECRET="your_gearup_super_secret_access_key_min_32_chars"
JWT_REFRESH_SECRET="your_gearup_super_secret_refresh_key_min_32_chars"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe Payment Secrets
STRIPE_SECRET_KEY="sk_test_51Pxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET_ROLLING=""
```

#### `src/config/index.ts`
```ts
// src/config/index.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
  port: Number(process.env.PORT) || 5000,
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
};
```

---

### 2.6 Architectural Roles & Layer Responsibilities

| Directory / File | Architectural Role | Responsibility |
| :--- | :--- | :--- |
| `prisma/schema/*.prisma` | Data Contract | Multi-file database definitions, relational integrity, indices, and constraints. |
| `src/config/index.ts` | Config Layer | Strongly-typed environment variables validation. |
| `src/lib/` | Infrastructure Singletons | Single instance management for `PrismaClient` and `Stripe` SDK. |
| `src/middlewares/auth.ts` | Security Guard | Extracts Bearer token or cookies, verifies JWT, and guards routes by role (`CUSTOMER`, `PROVIDER`, `ADMIN`). |
| `src/middlewares/globalErrorHandler.ts` | Error Formatting | Formats all exceptions into standard `{ success: false, message, errorDetails }` JSON envelopes. |
| `src/utils/catchAsync.ts` | Async Control | Higher-order wrapper eliminating repetitive `try/catch` in controllers. |
| `src/utils/sendResponse.ts` | API Envelope | Standardizes success responses `{ success: true, statusCode, message, data, meta }`. |
| `src/modules/<feature>/` | Domain Boundary | Autonomous feature modules holding interfaces, controllers, services, and routes. |
| `src/app.ts` | Express Assembly | Middleware chain order: CORS $\to$ Raw Webhook parser $\to$ `express.json()` $\to$ Feature Routes $\to$ Error Handlers. |
| `src/server.ts` | Process Lifecycle | Connects to PostgreSQL via Prisma before binding the HTTP port. Handles clean shutdown. |

---

# Part 1: Prisma Model Schema (Production Multi-File & Consolidated)

Prisma multi-file schemas reside inside `prisma/schema/`. Below are all necessary schema files designed to handle all aspects of the GearUp rental ecosystem.

### 1. Global Enums (`prisma/schema/enums.prisma`)
```prisma
// prisma/schema/enums.prisma
enum Role {
  CUSTOMER
  PROVIDER
  ADMIN
}

enum UserStatus {
  ACTIVE
  BLOCKED
}

enum ItemCondition {
  NEW
  EXCELLENT
  GOOD
  FAIR
}

enum GearStatus {
  AVAILABLE
  MAINTENANCE
  UNAVAILABLE
}

enum RentalOrderStatus {
  PLACED
  CONFIRMED
  PAID
  PICKED_UP
  RETURNED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  STRIPE
}
```

### 2. User Entity (`prisma/schema/user.prisma`)
```prisma
// prisma/schema/user.prisma
model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  password     String
  role         Role          @default(CUSTOMER)
  status       UserStatus    @default(ACTIVE)
  phone        String?
  address      String?
  profileImage String?

  // Relations
  gearItems    GearItem[]    @relation("ProviderGearItems")
  rentalOrders RentalOrder[] @relation("CustomerRentalOrders")
  reviews      Review[]      @relation("CustomerReviews")
  payments     Payment[]     @relation("CustomerPayments")

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([email])
  @@index([role])
  @@map("users")
}
```

### 3. Category Entity (`prisma/schema/category.prisma`)
```prisma
// prisma/schema/category.prisma
model Category {
  id          String     @id @default(uuid())
  name        String     @unique
  slug        String     @unique
  description String?
  iconUrl     String?

  // Relations
  gearItems   GearItem[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("categories")
}
```

### 4. Gear Item Entity (`prisma/schema/gearItem.prisma`)
```prisma
// prisma/schema/gearItem.prisma
model GearItem {
  id                String            @id @default(uuid())
  title             String
  slug              String            @unique
  description       String
  brand             String
  model             String?
  condition         ItemCondition     @default(EXCELLENT)
  rentalPricePerDay Float
  depositFee        Float             @default(0)
  totalStock        Int               @default(1)
  availableStock    Int               @default(1)
  location          String
  images            String[]          // PostgreSQL text array
  specifications    Json?             // Structured technical specs
  status            GearStatus        @default(AVAILABLE)

  // Relations
  providerId        String
  provider          User              @relation("ProviderGearItems", fields: [providerId], references: [id], onDelete: Cascade)

  categoryId        String
  category          Category          @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  orderItems        RentalOrderItem[]
  reviews           Review[]

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([providerId])
  @@index([categoryId])
  @@index([brand])
  @@index([rentalPricePerDay])
  @@map("gear_items")
}
```

### 5. Rental Order Entities (`prisma/schema/rentalOrder.prisma`)
```prisma
// prisma/schema/rentalOrder.prisma
model RentalOrder {
  id            String            @id @default(uuid())
  orderNumber   String            @unique
  startDate     DateTime
  endDate       DateTime
  totalDays     Int
  rentalFee     Float
  depositFee    Float
  totalAmount   Float
  status        RentalOrderStatus @default(PLACED)
  paymentStatus PaymentStatus     @default(PENDING)
  notes         String?

  // Relations
  customerId    String
  customer      User              @relation("CustomerRentalOrders", fields: [customerId], references: [id], onDelete: Cascade)

  items         RentalOrderItem[]
  payments      Payment[]
  reviews       Review[]

  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([customerId])
  @@index([status])
  @@index([paymentStatus])
  @@map("rental_orders")
}

model RentalOrderItem {
  id              String      @id @default(uuid())
  rentalOrderId   String
  rentalOrder     RentalOrder @relation(fields: [rentalOrderId], references: [id], onDelete: Cascade)

  gearItemId      String
  gearItem        GearItem    @relation(fields: [gearItemId], references: [id], onDelete: Restrict)

  quantity        Int         @default(1)
  unitPricePerDay Float
  depositPerUnit  Float
  subtotal        Float

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([rentalOrderId])
  @@index([gearItemId])
  @@map("rental_order_items")
}
```

### 6. Payment Entity (`prisma/schema/payment.prisma`)
```prisma
// prisma/schema/payment.prisma
model Payment {
  id                    String        @id @default(uuid())
  transactionId         String        @unique
  rentalOrderId         String
  rentalOrder           RentalOrder   @relation(fields: [rentalOrderId], references: [id], onDelete: Cascade)

  customerId            String
  customer              User          @relation("CustomerPayments", fields: [customerId], references: [id], onDelete: Cascade)

  amount                Float
  currency              String        @default("usd")
  method                PaymentMethod @default(STRIPE)
  status                PaymentStatus @default(PENDING)

  stripeSessionId       String?       @unique
  stripePaymentIntentId String?       @unique
  paidAt                DateTime?

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  @@index([rentalOrderId])
  @@index([customerId])
  @@index([stripeSessionId])
  @@map("payments")
}
```

### 7. Review Entity (`prisma/schema/review.prisma`)
```prisma
// prisma/schema/review.prisma
model Review {
  id            String      @id @default(uuid())
  rating        Int         // Range: 1 to 5
  comment       String

  customerId    String
  customer      User        @relation("CustomerReviews", fields: [customerId], references: [id], onDelete: Cascade)

  gearItemId    String
  gearItem      GearItem    @relation(fields: [gearItemId], references: [id], onDelete: Cascade)

  rentalOrderId String
  rentalOrder   RentalOrder @relation(fields: [rentalOrderId], references: [id], onDelete: Cascade)

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([customerId, rentalOrderId, gearItemId]) // One review per item per rental
  @@index([gearItemId])
  @@index([customerId])
  @@map("reviews")
}
```

### 8. Webhook Idempotency Entity (`prisma/schema/webhookLog.prisma`)
```prisma
// prisma/schema/webhookLog.prisma
model WebhookLog {
  id          String   @id @default(uuid())
  eventId     String   @unique
  eventType   String
  processedAt DateTime @default(now())

  @@index([eventId])
  @@map("webhook_logs")
}
```

### 9. Consolidated Single-File `schema.prisma`
For projects adopting a single schema file (`prisma/schema.prisma`), combine the generators and models above:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  PROVIDER
  ADMIN
}

enum UserStatus {
  ACTIVE
  BLOCKED
}

enum ItemCondition {
  NEW
  EXCELLENT
  GOOD
  FAIR
}

enum GearStatus {
  AVAILABLE
  MAINTENANCE
  UNAVAILABLE
}

enum RentalOrderStatus {
  PLACED
  CONFIRMED
  PAID
  PICKED_UP
  RETURNED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  STRIPE
}

model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  password     String
  role         Role          @default(CUSTOMER)
  status       UserStatus    @default(ACTIVE)
  phone        String?
  address      String?
  profileImage String?

  gearItems    GearItem[]    @relation("ProviderGearItems")
  rentalOrders RentalOrder[] @relation("CustomerRentalOrders")
  reviews      Review[]      @relation("CustomerReviews")
  payments     Payment[]     @relation("CustomerPayments")

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([email])
  @@index([role])
  @@map("users")
}

model Category {
  id          String     @id @default(uuid())
  name        String     @unique
  slug        String     @unique
  description String?
  iconUrl     String?

  gearItems   GearItem[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("categories")
}

model GearItem {
  id                String            @id @default(uuid())
  title             String
  slug              String            @unique
  description       String
  brand             String
  model             String?
  condition         ItemCondition     @default(EXCELLENT)
  rentalPricePerDay Float
  depositFee        Float             @default(0)
  totalStock        Int               @default(1)
  availableStock    Int               @default(1)
  location          String
  images            String[]
  specifications    Json?
  status            GearStatus        @default(AVAILABLE)

  providerId        String
  provider          User              @relation("ProviderGearItems", fields: [providerId], references: [id], onDelete: Cascade)

  categoryId        String
  category          Category          @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  orderItems        RentalOrderItem[]
  reviews           Review[]

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([providerId])
  @@index([categoryId])
  @@index([brand])
  @@index([rentalPricePerDay])
  @@map("gear_items")
}

model RentalOrder {
  id            String            @id @default(uuid())
  orderNumber   String            @unique
  startDate     DateTime
  endDate       DateTime
  totalDays     Int
  rentalFee     Float
  depositFee    Float
  totalAmount   Float
  status        RentalOrderStatus @default(PLACED)
  paymentStatus PaymentStatus     @default(PENDING)
  notes         String?

  customerId    String
  customer      User              @relation("CustomerRentalOrders", fields: [customerId], references: [id], onDelete: Cascade)

  items         RentalOrderItem[]
  payments      Payment[]
  reviews       Review[]

  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([customerId])
  @@index([status])
  @@index([paymentStatus])
  @@map("rental_orders")
}

model RentalOrderItem {
  id              String      @id @default(uuid())
  rentalOrderId   String
  rentalOrder     RentalOrder @relation(fields: [rentalOrderId], references: [id], onDelete: Cascade)

  gearItemId      String
  gearItem        GearItem    @relation(fields: [gearItemId], references: [id], onDelete: Restrict)

  quantity        Int         @default(1)
  unitPricePerDay Float
  depositPerUnit  Float
  subtotal        Float

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([rentalOrderId])
  @@index([gearItemId])
  @@map("rental_order_items")
}

model Payment {
  id                    String        @id @default(uuid())
  transactionId         String        @unique
  rentalOrderId         String
  rentalOrder           RentalOrder   @relation(fields: [rentalOrderId], references: [id], onDelete: Cascade)

  customerId            String
  customer              User          @relation("CustomerPayments", fields: [customerId], references: [id], onDelete: Cascade)

  amount                Float
  currency              String        @default("usd")
  method                PaymentMethod @default(STRIPE)
  status                PaymentStatus @default(PENDING)

  stripeSessionId       String?       @unique
  stripePaymentIntentId String?       @unique
  paidAt                DateTime?

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  @@index([rentalOrderId])
  @@index([customerId])
  @@index([stripeSessionId])
  @@map("payments")
}

model Review {
  id            String      @id @default(uuid())
  rating        Int
  comment       String

  customerId    String
  customer      User        @relation("CustomerReviews", fields: [customerId], references: [id], onDelete: Cascade)

  gearItemId    String
  gearItem      GearItem    @relation(fields: [gearItemId], references: [id], onDelete: Cascade)

  rentalOrderId String
  rentalOrder   RentalOrder @relation(fields: [rentalOrderId], references: [id], onDelete: Cascade)

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([customerId, rentalOrderId, gearItemId])
  @@index([gearItemId])
  @@index([customerId])
  @@map("reviews")
}

model WebhookLog {
  id          String   @id @default(uuid())
  eventId     String   @unique
  eventType   String
  processedAt DateTime @default(now())

  @@index([eventId])
  @@map("webhook_logs")
}
```

### Running the Database Migration
Execute in your terminal:
```bash
npx prisma migrate dev --name init_gearup_schema
npx prisma generate
```

---

# Part 2: API Endpoints Catalog & Step-by-Step Implementation

### Complete API Endpoints Catalog

| Domain | Method | Endpoint | Access Guard | Description |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register as `CUSTOMER` or `PROVIDER` |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT Access & Refresh tokens |
| **Auth** | `POST` | `/api/auth/refresh-token` | Public | Obtain fresh access token via refresh token |
| **Auth** | `GET` | `/api/auth/me` | All Authenticated | Get current user's profile |
| **Auth** | `PATCH` | `/api/auth/profile` | All Authenticated | Update phone, address, profile image |
| **Auth** | `POST` | `/api/auth/change-password`| All Authenticated | Change user account password |
| **Admin**| `GET` | `/api/admin/users` | `ADMIN` | Fetch all users with search, role filters, & pagination |
| **Admin**| `PATCH` | `/api/admin/users/:id` | `ADMIN` | Update user status (`ACTIVE` / `BLOCKED`) |
| **Category**| `POST` | `/api/categories` | `ADMIN` | Create a sports gear category |
| **Category**| `GET` | `/api/categories` | Public | List all categories with gear count |
| **Category**| `GET` | `/api/categories/:id` | Public | Fetch category details |
| **Category**| `PATCH` | `/api/categories/:id` | `ADMIN` | Update category information |
| **Category**| `DELETE`| `/api/categories/:id` | `ADMIN` | Remove empty category |
| **Gear** | `GET` | `/api/gear` | Public | Browse all gear with search, category, brand, & price filter |
| **Gear** | `GET` | `/api/gear/:id` | Public | Retrieve gear specifications and customer reviews |
| **Provider**| `POST` | `/api/provider/gear` | `PROVIDER` | Add new gear item to inventory |
| **Provider**| `PUT` | `/api/provider/gear/:id`| `PROVIDER` | Update gear item specifications, price, or stock |
| **Provider**| `DELETE`| `/api/provider/gear/:id`| `PROVIDER` | Delete/archive gear item |
| **Provider**| `GET` | `/api/provider/my-gear` | `PROVIDER` | View provider's own gear inventory list |
| **Rentals** | `POST` | `/api/rentals` | `CUSTOMER` | Place rental order for gear items & dates |
| **Rentals** | `GET` | `/api/rentals` | `CUSTOMER` | View authenticated customer's rental history |
| **Rentals** | `GET` | `/api/rentals/:id` | `CUSTOMER`, `PROVIDER`, `ADMIN` | View detailed rental order breakdown |
| **Rentals** | `PATCH` | `/api/rentals/:id/cancel`| `CUSTOMER`, `ADMIN` | Cancel unpaid order |
| **Provider Orders**| `GET`| `/api/provider/orders` | `PROVIDER` | View incoming rental orders for provider's gear |
| **Provider Orders**| `PATCH`| `/api/provider/orders/:id`| `PROVIDER` | Update order status (`CONFIRMED`, `PICKED_UP`, `RETURNED`)|
| **Admin Orders**| `GET` | `/api/admin/rentals` | `ADMIN` | Overview of all rental orders across the platform |
| **Payments**| `POST` | `/api/payments/create` | `CUSTOMER` | Create Stripe checkout session for rental order |
| **Payments**| `POST` | `/api/payments/confirm`| Public (Stripe Signature) | Raw Webhook handler for Stripe payment events |
| **Payments**| `GET` | `/api/payments` | `CUSTOMER` | View user's personal payment history |
| **Payments**| `GET` | `/api/payments/:id` | `CUSTOMER`, `ADMIN` | Get specific payment receipt details |
| **Reviews** | `POST` | `/api/reviews` | `CUSTOMER` | Submit rating & review for completed (`RETURNED`) rental |
| **Reviews** | `GET` | `/api/reviews/gear/:gearId` | Public | Get all verified reviews for specific gear item |

---

### Core Utilities & Shared Middlewares

To ensure consistency throughout all controllers, we implement the core singletons and wrappers:

#### 1. Singletons (`src/lib/prisma.ts`)
```ts
// src/lib/prisma.ts
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

#### 2. Async Wrapper (`src/utils/catchAsync.ts`)
```ts
// src/utils/catchAsync.ts
import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
```

#### 3. Standard Envelope Response (`src/utils/sendResponse.ts`)
```ts
// src/utils/sendResponse.ts
import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages?: number };
};

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
```

#### 4. JWT Middleware Guard (`src/middlewares/auth.ts`)
```ts
// src/middlewares/auth.ts
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import { config } from "../config";
import { catchAsync } from "../utils/catchAsync";

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
    const rawHeader = req.headers.authorization;
    const token = req.cookies?.accessToken || (rawHeader?.startsWith("Bearer ") ? rawHeader.split(" ")[1] : rawHeader);

    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required. Access token missing.",
      });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt_access_secret) as JwtPayload;
    } catch (err: any) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: err.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token",
      });
    }

    const userRole = decoded.role as Role;
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: `Forbidden: Access requires one of [${requiredRoles.join(", ")}] roles.`,
      });
    }

    req.user = { id: decoded.id, email: decoded.email, role: userRole };
    next();
  });
};
```

---

### Module 1: Authentication & Profile (`/api/auth`)

#### Service (`src/modules/auth/auth.service.ts`)
```ts
// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { config } from "../../config";
import { TRegisterPayload, TLoginPayload, TChangePasswordPayload, TUpdateProfilePayload } from "./auth.interface";

const registerUser = async (payload: TRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    const err: any = new Error("An account with this email already exists.");
    err.statusCode = httpStatus.CONFLICT;
    throw err;
  }

  const role = payload.role === Role.ADMIN ? Role.CUSTOMER : payload.role; // Prevent unauthorized admin signup
  const hashedPassword = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds);

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: role || Role.CUSTOMER,
      phone: payload.phone,
      address: payload.address,
    },
    select: { id: true, name: true, email: true, role: true, phone: true, address: true, createdAt: true },
  });

  return newUser;
};

const loginUser = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    const err: any = new Error("Invalid email or password.");
    err.statusCode = httpStatus.UNAUTHORIZED;
    throw err;
  }

  if (user.status === UserStatus.BLOCKED) {
    const err: any = new Error("Your account has been suspended. Please contact support.");
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    const err: any = new Error("Invalid email or password.");
    err.statusCode = httpStatus.UNAUTHORIZED;
    throw err;
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(tokenPayload, config.jwt_access_secret, { expiresIn: "1d" });
  const refreshToken = jwt.sign(tokenPayload, config.jwt_refresh_secret, { expiresIn: "7d" });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

const getMe = async (userId: string) => {
  return await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, status: true, phone: true, address: true, profileImage: true, createdAt: true },
  });
};

const updateProfile = async (userId: string, payload: TUpdateProfilePayload) => {
  return await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: { id: true, name: true, email: true, role: true, phone: true, address: true, profileImage: true },
  });
};

const changePassword = async (userId: string, payload: TChangePasswordPayload) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
  if (!isMatch) {
    const err: any = new Error("Incorrect old password.");
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  const newHashed = await bcrypt.hash(payload.newPassword, config.bcrypt_salt_rounds);
  await prisma.user.update({
    where: { id: userId },
    data: { password: newHashed },
  });

  return { message: "Password updated successfully." };
};

export const authServices = { registerUser, loginUser, getMe, updateProfile, changePassword };
```

#### Controller (`src/modules/auth/auth.controller.ts`)
```ts
// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authServices } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: { accessToken: result.accessToken, user: result.user },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.getMe(req.user!.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.updateProfile(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.changePassword(req.user!.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const authController = { register, login, getMe, updateProfile, changePassword };
```

#### Route (`src/modules/auth/auth.route.ts`)
```ts
// src/modules/auth/auth.route.ts
import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth(), authController.getMe);
router.patch("/profile", auth(), authController.updateProfile);
router.post("/change-password", auth(), authController.changePassword);

export const authRoutes = router;
```

---

### Module 2: User Administration (`/api/admin/users`)

#### Service & Controller (`src/modules/admin/admin.service.ts`)
```ts
// src/modules/admin/admin.service.ts
import { UserStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async (query: { role?: Role; status?: UserStatus; search?: string; page?: string; limit?: string }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereCondition: any = {};
  if (query.role) whereCondition.role = query.role;
  if (query.status) whereCondition.status = query.status;
  if (query.search) {
    whereCondition.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, status: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, status: true, role: true },
  });
};

export const adminServices = { getAllUsers, updateUserStatus };
```

#### Routes (`src/modules/admin/admin.route.ts`)
```ts
// src/modules/admin/admin.route.ts
import { Router } from "express";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.service";

const router = Router();

router.get("/users", auth(Role.ADMIN), catchAsync(async (req, res) => {
  const result = await adminServices.getAllUsers(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result.users,
    meta: result.meta,
  });
}));

router.patch("/users/:id", auth(Role.ADMIN), catchAsync(async (req, res) => {
  const result = await adminServices.updateUserStatus(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
}));

export const adminRoutes = router;
```

---

### Module 3: Categories (`/api/categories`)

```ts
// src/modules/category/category.service.ts
import { prisma } from "../../lib/prisma";

const createCategory = async (payload: { name: string; slug: string; description?: string; iconUrl?: string }) => {
  return await prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: { _count: { select: { gearItems: true } } },
    orderBy: { name: "asc" },
  });
};

const getCategoryById = async (id: string) => {
  return await prisma.category.findUniqueOrThrow({
    where: { id },
    include: { gearItems: { take: 10 } },
  });
};

const updateCategory = async (id: string, payload: any) => {
  return await prisma.category.update({ where: { id }, data: payload });
};

const deleteCategory = async (id: string) => {
  return await prisma.category.delete({ where: { id } });
};

export const categoryServices = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
```

---

### Module 4: Gear Inventory & Public Catalog (`/api/gear` & `/api/provider/gear`)

#### Service (`src/modules/gear/gear.service.ts`)
```ts
// src/modules/gear/gear.service.ts
import { GearStatus, ItemCondition } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllGear = async (filters: {
  search?: string;
  categoryId?: string;
  brand?: string;
  condition?: ItemCondition;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 12;
  const skip = (page - 1) * limit;

  const where: any = { status: GearStatus.AVAILABLE };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.brand) where.brand = { contains: filters.brand, mode: "insensitive" };
  if (filters.condition) where.condition = filters.condition;
  if (filters.minPrice || filters.maxPrice) {
    where.rentalPricePerDay = {};
    if (filters.minPrice) where.rentalPricePerDay.gte = Number(filters.minPrice);
    if (filters.maxPrice) where.rentalPricePerDay.lte = Number(filters.maxPrice);
  }

  const orderBy: any = {};
  if (filters.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || "asc";
  } else {
    orderBy.createdAt = "desc";
  }

  const [items, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
      },
    }),
    prisma.gearItem.count({ where }),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getGearById = async (id: string) => {
  return await prisma.gearItem.findUniqueOrThrow({
    where: { id },
    include: {
      category: true,
      provider: { select: { id: true, name: true, phone: true } },
      reviews: {
        include: { customer: { select: { id: true, name: true, profileImage: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

const addGearByProvider = async (providerId: string, payload: any) => {
  return await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
      availableStock: payload.totalStock,
    },
  });
};

const updateGearByProvider = async (gearId: string, providerId: string, payload: any) => {
  // Ensure provider owns the item
  await prisma.gearItem.findFirstOrThrow({ where: { id: gearId, providerId } });
  return await prisma.gearItem.update({
    where: { id: gearId },
    data: payload,
  });
};

const deleteGearByProvider = async (gearId: string, providerId: string) => {
  await prisma.gearItem.findFirstOrThrow({ where: { id: gearId, providerId } });
  return await prisma.gearItem.delete({ where: { id: gearId } });
};

const getProviderGear = async (providerId: string) => {
  return await prisma.gearItem.findMany({
    where: { providerId },
    include: { category: { select: { name: true } }, _count: { select: { orderItems: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const gearServices = {
  getAllGear,
  getGearById,
  addGearByProvider,
  updateGearByProvider,
  deleteGearByProvider,
  getProviderGear,
};
```

---

### Module 5: Rental Orders (`/api/rentals`, `/api/provider/orders`, `/api/admin/rentals`)

#### Service (`src/modules/rental/rental.service.ts`)
```ts
// src/modules/rental/rental.service.ts
import httpStatus from "http-status";
import { RentalOrderStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

type TRentalItemInput = {
  gearItemId: string;
  quantity: number;
};

type TCreateRentalPayload = {
  startDate: string;
  endDate: string;
  items: TRentalItemInput[];
  notes?: string;
};

const createRentalOrder = async (customerId: string, payload: TCreateRentalPayload) => {
  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    const err: any = new Error("Rental end date must be after start date.");
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    let calculatedRentalFee = 0;
    let calculatedDepositFee = 0;
    const orderItemsData: any[] = [];

    for (const item of payload.items) {
      const gear = await tx.gearItem.findUniqueOrThrow({ where: { id: item.gearItemId } });

      if (gear.availableStock < item.quantity) {
        const err: any = new Error(`Item ${gear.title} does not have enough stock available.`);
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
      }

      const itemRentalCost = gear.rentalPricePerDay * diffDays * item.quantity;
      const itemDepositCost = gear.depositFee * item.quantity;

      calculatedRentalFee += itemRentalCost;
      calculatedDepositFee += itemDepositCost;

      orderItemsData.push({
        gearItemId: gear.id,
        quantity: item.quantity,
        unitPricePerDay: gear.rentalPricePerDay,
        depositPerUnit: gear.depositFee,
        subtotal: itemRentalCost + itemDepositCost,
      });
    }

    const totalAmount = calculatedRentalFee + calculatedDepositFee;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = await tx.rentalOrder.create({
      data: {
        orderNumber,
        customerId,
        startDate: start,
        endDate: end,
        totalDays: diffDays,
        rentalFee: calculatedRentalFee,
        depositFee: calculatedDepositFee,
        totalAmount,
        status: RentalOrderStatus.PLACED,
        paymentStatus: PaymentStatus.PENDING,
        notes: payload.notes,
        items: { create: orderItemsData },
      },
      include: { items: { include: { gearItem: true } } },
    });

    return newOrder;
  });
};

const getCustomerRentals = async (customerId: string) => {
  return await prisma.rentalOrder.findMany({
    where: { customerId },
    include: { items: { include: { gearItem: { select: { title: true, images: true } } } }, payments: true },
    orderBy: { createdAt: "desc" },
  });
};

const getProviderIncomingOrders = async (providerId: string) => {
  return await prisma.rentalOrder.findMany({
    where: {
      items: { some: { gearItem: { providerId } } },
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      items: { include: { gearItem: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateOrderStatusByProvider = async (orderId: string, providerId: string, nextStatus: RentalOrderStatus) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { gearItem: true } } },
    });

    // Verify provider owns at least one item in the order
    const ownsItem = order.items.some((i) => i.gearItem.providerId === providerId);
    if (!ownsItem) {
      const err: any = new Error("Forbidden: Order does not contain gear items owned by you.");
      err.statusCode = httpStatus.FORBIDDEN;
      throw err;
    }

    // Workflow business logic
    if (nextStatus === RentalOrderStatus.RETURNED && order.status !== RentalOrderStatus.RETURNED) {
      // Restore gear stock upon physical equipment return
      for (const item of order.items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: { availableStock: { increment: item.quantity } },
        });
      }
    }

    return await tx.rentalOrder.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });
  });
};

const cancelRentalOrder = async (orderId: string, userId: string, userRole: string) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });

    if (userRole !== "ADMIN" && order.customerId !== userId) {
      const err: any = new Error("Forbidden: You cannot cancel this order.");
      err.statusCode = httpStatus.FORBIDDEN;
      throw err;
    }

    if (order.status === RentalOrderStatus.PICKED_UP || order.status === RentalOrderStatus.RETURNED) {
      const err: any = new Error("Cannot cancel an order that has already been picked up or completed.");
      err.statusCode = httpStatus.BAD_REQUEST;
      throw err;
    }

    // Release stock if it was previously confirmed/decremented
    if (order.paymentStatus === PaymentStatus.PAID) {
      for (const item of order.items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: { availableStock: { increment: item.quantity } },
        });
      }
    }

    return await tx.rentalOrder.update({
      where: { id: orderId },
      data: { status: RentalOrderStatus.CANCELLED },
    });
  });
};

export const rentalServices = {
  createRentalOrder,
  getCustomerRentals,
  getProviderIncomingOrders,
  updateOrderStatusByProvider,
  cancelRentalOrder,
};
```

---

### Module 6: Reviews & Ratings (`/api/reviews`)

#### Service (`src/modules/review/review.service.ts`)
```ts
// src/modules/review/review.service.ts
import httpStatus from "http-status";
import { RentalOrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createReview = async (customerId: string, payload: { rentalOrderId: string; gearItemId: string; rating: number; comment: string }) => {
  if (payload.rating < 1 || payload.rating > 5) {
    const err: any = new Error("Rating must be between 1 and 5.");
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  // 1. Verify rental order belongs to this customer and status is RETURNED
  const order = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: payload.rentalOrderId },
    include: { items: true },
  });

  if (order.customerId !== customerId) {
    const err: any = new Error("You can only review rentals booked by your account.");
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  if (order.status !== RentalOrderStatus.RETURNED) {
    const err: any = new Error("Reviews can only be submitted after the gear item has been returned.");
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  // 2. Verify gear item was part of the rental
  const hasItem = order.items.some((i) => i.gearItemId === payload.gearItemId);
  if (!hasItem) {
    const err: any = new Error("Gear item was not in this rental order.");
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  // 3. Create review with idempotency constraint
  return await prisma.review.create({
    data: {
      customerId,
      rentalOrderId: payload.rentalOrderId,
      gearItemId: payload.gearItemId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
};

const getGearReviews = async (gearItemId: string) => {
  return await prisma.review.findMany({
    where: { gearItemId },
    include: { customer: { select: { id: true, name: true, profileImage: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const reviewServices = { createReview, getGearReviews };
```

---

# Part 3: Production Demo Data Seeding (`prisma/seed.ts`)

A production seed script generates deterministic, high-fidelity demo records across all roles and tables.

### Complete Seed Script (`prisma/seed.ts`)
```ts
// prisma/seed.ts
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import {
  Role,
  UserStatus,
  ItemCondition,
  GearStatus,
  RentalOrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../generated/prisma/enums";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting GearUp database seeding...");

  // 1. Clean existing records in reverse relational order
  await prisma.webhookLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalOrderItem.deleteMany();
  await prisma.rentalOrder.deleteMany();
  await prisma.gearItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Previous records cleaned.");

  const defaultPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("password123", 12);

  // 2. Seed Users across all 3 roles
  const admin = await prisma.user.create({
    data: {
      name: "GearUp Master Admin",
      email: "admin@gearup.com",
      password: defaultPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      phone: "+1-800-555-0100",
      address: "100 Innovation Way, San Francisco, CA",
    },
  });

  const provider1 = await prisma.user.create({
    data: {
      name: "Summit Outdoor Outfitter",
      email: "summit.sports@gearup.com",
      password: userPassword,
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-019-2834",
      address: "42 Alpine Trail, Boulder, CO",
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      name: "Cascade Water & Snow Hub",
      email: "cascade.rentals@gearup.com",
      password: userPassword,
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-014-9821",
      address: "88 Pacific Coast Hwy, Seattle, WA",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "John Trekkers",
      email: "john.customer@gmail.com",
      password: userPassword,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-018-7721",
      address: "742 Evergreen Terrace, Springfield, OR",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Sarah Outdoors",
      email: "sarah.gear@gmail.com",
      password: userPassword,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      phone: "+1-555-017-3392",
      address: "123 Lake View Dr, Denver, CO",
    },
  });

  console.log("✅ Seeded 1 Admin, 2 Providers, 2 Customers.");

  // 3. Seed Gear Categories
  const catCamping = await prisma.category.create({
    data: {
      name: "Camping & Hiking",
      slug: "camping-hiking",
      description: "Tents, sleeping bags, stoves, and mountaineering backpacks.",
      iconUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
    },
  });

  const catCycling = await prisma.category.create({
    data: {
      name: "Cycling & Mountain Biking",
      slug: "cycling-mountain-biking",
      description: "Downhill mountain bikes, gravel bikes, safety helmets, and panniers.",
      iconUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
    },
  });

  const catWater = await prisma.category.create({
    data: {
      name: "Water Sports",
      slug: "water-sports",
      description: "Kayaks, stand-up paddleboards, wetsuits, and life jackets.",
      iconUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
    },
  });

  const catWinter = await prisma.category.create({
    data: {
      name: "Winter Sports",
      slug: "winter-sports",
      description: "Snowboards, alpine ski sets, avalanche safety beacons, and poles.",
      iconUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256",
    },
  });

  console.log("✅ Seeded 4 Categories.");

  // 4. Seed Gear Items
  const gearTent = await prisma.gearItem.create({
    data: {
      title: "MSR Hubba Hubba 3-Person Ultralight Backpacking Tent",
      slug: "msr-hubba-hubba-3p-tent",
      description: "Award-winning freestanding 3-season tent with high durability rainfly and Easton Syclone poles.",
      brand: "MSR",
      model: "Hubba Hubba 3P",
      condition: ItemCondition.EXCELLENT,
      rentalPricePerDay: 25.0,
      depositFee: 75.0,
      totalStock: 5,
      availableStock: 5,
      location: "Boulder, CO",
      images: [
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d",
      ],
      specifications: { capacity: "3 Person", weight: "1.72 kg", floorArea: "3.67 sq m" },
      status: GearStatus.AVAILABLE,
      providerId: provider1.id,
      categoryId: catCamping.id,
    },
  });

  const gearBike = await prisma.gearItem.create({
    data: {
      title: "Trek Fuel EX 8 Gen 6 Full Suspension Trail Mountain Bike",
      slug: "trek-fuel-ex-8-mountain-bike",
      description: "Versatile aluminum trail bike with FOX Rhythm 36 fork and Shimano XT 12-speed drivetrain.",
      brand: "Trek",
      model: "Fuel EX 8",
      condition: ItemCondition.NEW,
      rentalPricePerDay: 65.0,
      depositFee: 150.0,
      totalStock: 3,
      availableStock: 2, // 1 in active rental
      location: "Boulder, CO",
      images: [
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      ],
      specifications: { frame: "Alpha Platinum Aluminum", travel: "150mm front / 140mm rear", size: "Large" },
      status: GearStatus.AVAILABLE,
      providerId: provider1.id,
      categoryId: catCycling.id,
    },
  });

  const gearKayak = await prisma.gearItem.create({
    data: {
      title: "Oru Kayak Inlet Foldable Touring Kayak with Paddle",
      slug: "oru-kayak-inlet-foldable",
      description: "Origami-inspired lightweight kayak that folds down into a compact box in under 3 minutes.",
      brand: "Oru Kayak",
      model: "Inlet",
      condition: ItemCondition.EXCELLENT,
      rentalPricePerDay: 40.0,
      depositFee: 100.0,
      totalStock: 4,
      availableStock: 4,
      location: "Seattle, WA",
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
      ],
      specifications: { length: "10 ft", weight: "9 kg", maxCapacity: "125 kg" },
      status: GearStatus.AVAILABLE,
      providerId: provider2.id,
      categoryId: catWater.id,
    },
  });

  console.log("✅ Seeded Gear Items.");

  // 5. Seed Complete Lifecycle Rental Orders & Transactions
  // Order 1: Completed, Paid & Returned with verified review
  const orderCompleted = await prisma.rentalOrder.create({
    data: {
      orderNumber: "ORD-991201-842",
      customerId: customer1.id,
      startDate: new Date("2026-06-01T09:00:00Z"),
      endDate: new Date("2026-06-04T18:00:00Z"),
      totalDays: 3,
      rentalFee: 75.0, // $25/day * 3 days
      depositFee: 75.0,
      totalAmount: 150.0,
      status: RentalOrderStatus.RETURNED,
      paymentStatus: PaymentStatus.PAID,
      items: {
        create: {
          gearItemId: gearTent.id,
          quantity: 1,
          unitPricePerDay: 25.0,
          depositPerUnit: 75.0,
          subtotal: 150.0,
        },
      },
    },
  });

  await prisma.payment.create({
    data: {
      transactionId: "txn_demo_complete_001",
      rentalOrderId: orderCompleted.id,
      customerId: customer1.id,
      amount: 150.0,
      currency: "usd",
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.PAID,
      stripeSessionId: "cs_test_completed_sample_session_1",
      stripePaymentIntentId: "pi_test_completed_intent_1",
      paidAt: new Date("2026-06-01T08:30:00Z"),
    },
  });

  await prisma.review.create({
    data: {
      customerId: customer1.id,
      gearItemId: gearTent.id,
      rentalOrderId: orderCompleted.id,
      rating: 5,
      comment: "Tent was pristine, lightweight, and withstood heavy wind in Rocky Mountain National Park!",
    },
  });

  // Order 2: Active Ongoing Rental (Paid, Picked Up)
  const orderActive = await prisma.rentalOrder.create({
    data: {
      orderNumber: "ORD-882314-119",
      customerId: customer2.id,
      startDate: new Date("2026-07-01T10:00:00Z"),
      endDate: new Date("2026-07-03T18:00:00Z"),
      totalDays: 2,
      rentalFee: 130.0, // $65/day * 2 days
      depositFee: 150.0,
      totalAmount: 280.0,
      status: RentalOrderStatus.PICKED_UP,
      paymentStatus: PaymentStatus.PAID,
      items: {
        create: {
          gearItemId: gearBike.id,
          quantity: 1,
          unitPricePerDay: 65.0,
          depositPerUnit: 150.0,
          subtotal: 280.0,
        },
      },
    },
  });

  await prisma.payment.create({
    data: {
      transactionId: "txn_demo_active_002",
      rentalOrderId: orderActive.id,
      customerId: customer2.id,
      amount: 280.0,
      currency: "usd",
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.PAID,
      stripeSessionId: "cs_test_active_sample_session_2",
      stripePaymentIntentId: "pi_test_active_intent_2",
      paidAt: new Date("2026-07-01T09:15:00Z"),
    },
  });

  console.log("✅ Seeded Orders, Payments & Customer Reviews.");
  console.log("🚀 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Configuring and Executing the Seed

1. In your `package.json`, add the `"prisma"` configuration block:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

2. Run the seeding script:
```bash
npx prisma db seed
```

---

# Part 4: API Endpoint Testing Master Guide & Test Suite

### Sequential Execution Flow

To thoroughly test the entire platform without state collisions, execute calls in the following strict lifecycle order:

```
1. POST /api/auth/register (Create Customer & Provider accounts)
2. POST /api/auth/login (Obtain Customer & Provider JWT tokens)
3. POST /api/categories (Admin creates Category)
4. POST /api/provider/gear (Provider adds gear listing)
5. GET  /api/gear (Customer browses & filters gear)
6. POST /api/rentals (Customer creates rental order -> Status: PLACED)
7. POST /api/payments/create (Customer initiates Stripe Checkout)
8. POST /api/payments/confirm (Stripe Webhook fires -> Status: PAID)
9. PATCH /api/provider/orders/:id (Provider marks PICKED_UP, then RETURNED)
10. POST /api/reviews (Customer submits 5-star review on RETURNED gear)
```

---

### Detailed Test Matrix with Request Bodies & Expected Responses

#### 1. Register Customer
- **Endpoint**: `POST http://localhost:5000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Jane Explorer",
  "email": "jane.explorer@example.com",
  "password": "Password123!",
  "role": "CUSTOMER",
  "phone": "+1-555-908-1122",
  "address": "45 Trailhead Way, Aspen, CO"
}
```
- **Expected Status**: `201 Created`
- **Response**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "e98b04d1-c1e5-424a-b50a-f111812a1491",
    "name": "Jane Explorer",
    "email": "jane.explorer@example.com",
    "role": "CUSTOMER",
    "phone": "+1-555-908-1122"
  }
}
```

#### 2. Login User
- **Endpoint**: `POST http://localhost:5000/api/auth/login`
- **Request Body**:
```json
{
  "email": "jane.explorer@example.com",
  "password": "Password123!"
}
```
- **Expected Status**: `200 OK`
- **Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e98b04d1-c1e5-424a-b50a-f111812a1491",
      "name": "Jane Explorer",
      "email": "jane.explorer@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

#### 3. Create Gear Listing (Provider Only)
- **Endpoint**: `POST http://localhost:5000/api/provider/gear`
- **Headers**:
  - `Authorization`: `Bearer <PROVIDER_JWT_TOKEN>`
  - `Content-Type`: `application/json`
- **Request Body**:
```json
{
  "title": "Black Diamond Carbon Cork Trekking Poles",
  "slug": "bd-carbon-cork-poles",
  "description": "Premium 100% carbon fiber trekking poles with ergonomic cork grips.",
  "brand": "Black Diamond",
  "model": "Alpine Carbon Cork",
  "condition": "NEW",
  "rentalPricePerDay": 12.0,
  "depositFee": 30.0,
  "totalStock": 8,
  "location": "Aspen, CO",
  "images": ["https://images.unsplash.com/photo-1478131143081-80f7f84ca84d"],
  "categoryId": "<CATEGORY_UUID>"
}
```
- **Expected Status**: `201 Created`

#### 4. Filter Catalog by Price & Search (Public)
- **Endpoint**: `GET http://localhost:5000/api/gear?search=carbon&minPrice=10&maxPrice=50&page=1&limit=10`
- **Expected Status**: `200 OK`
- **Response**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gear retrieved successfully",
  "data": [
    {
      "id": "...",
      "title": "Black Diamond Carbon Cork Trekking Poles",
      "rentalPricePerDay": 12.0,
      "availableStock": 8,
      "category": { "name": "Camping & Hiking" }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

#### 5. Place Rental Order (Customer)
- **Endpoint**: `POST http://localhost:5000/api/rentals`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_JWT_TOKEN>`
  - `Content-Type`: `application/json`
- **Request Body**:
```json
{
  "startDate": "2026-08-10T10:00:00Z",
  "endDate": "2026-08-14T18:00:00Z",
  "items": [
    {
      "gearItemId": "<GEAR_ITEM_UUID>",
      "quantity": 2
    }
  ],
  "notes": "Will pick up at the Aspen store location."
}
```
- **Expected Status**: `201 Created`
- **Response Envelope**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Rental order placed successfully",
  "data": {
    "id": "ord_88192a_uuid",
    "orderNumber": "ORD-198231-771",
    "totalDays": 4,
    "rentalFee": 96.0,
    "depositFee": 60.0,
    "totalAmount": 156.0,
    "status": "PLACED",
    "paymentStatus": "PENDING"
  }
}
```

#### 6. Submit Verified Review (Customer)
- **Endpoint**: `POST http://localhost:5000/api/reviews`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_JWT_TOKEN>`
- **Request Body**:
```json
{
  "rentalOrderId": "<COMPLETED_RENTAL_ORDER_UUID>",
  "gearItemId": "<GEAR_ITEM_UUID>",
  "rating": 5,
  "comment": "Exceptional build quality, poles held up seamlessly across rocky climbs!"
}
```
- **Expected Status**: `201 Created`

---

### Negative & Role Guard Security Tests

| Scenario | Request | Expected Status | Expected Error Response |
| :--- | :--- | :---: | :--- |
| **Missing Token** | `GET /api/auth/me` with no header | `401 Unauthorized` | `{"success": false, "message": "Authentication required. Access token missing."}` |
| **Expired Token** | Request with expired JWT | `401 Unauthorized` | `{"success": false, "message": "Access token expired"}` |
| **Customer accessing Provider route** | `POST /api/provider/gear` with Customer token | `403 Forbidden` | `{"success": false, "message": "Forbidden: Access requires one of [PROVIDER] roles."}` |
| **Provider booking Rental** | `POST /api/rentals` with Provider token | `403 Forbidden` | `{"success": false, "message": "Forbidden: Access requires one of [CUSTOMER] roles."}` |
| **Exceeding Stock** | Book 99 units when only 2 exist | `400 Bad Request` | `{"success": false, "message": "Item Trek Fuel EX 8 does not have enough stock available."}` |
| **Reviewing Uncompleted Rental** | Review order with status `PLACED` | `400 Bad Request` | `{"success": false, "message": "Reviews can only be submitted after the gear item has been returned."}` |

---

# Part 5: Production Stripe Payment Implementation & Webhook Architecture

This payment and webhook implementation strictly adheres to the architecture established in **`Full_Project_SetUp.md`** (Phases 10, 11, 12, 14, and 15), tailored specifically for the **GearUp** sports equipment rental lifecycle.

---

### 5.1 Architecture & Ingress Flow (Local CLI vs. Production Cloud)

A truly production-grade webhook pipeline uses an identical codebase across all development and production environments. The diagram below illustrates how events travel from Stripe to the GearUp backend:

```mermaid
flowchart TD
    subgraph STAGE_1["Stage 1: Local Dev Machine"]
        LocalStripe[Stripe Test Environment] -->|API Event Trigger| LocalCLI[Stripe CLI Client]
        LocalCLI -->|HTTP POST :5000/api/payments/confirm| LocalApp[Local Express Engine]
        LocalApp -->|Verify whsec_test_...| LocalPrisma[(Local PostgreSQL)]
    end

    subgraph STAGE_2["Stage 2: Remote Staging Server"]
        StagingStripe[Stripe Test Environment] -->|Forward to Remote| StagingCLI[Remote Stripe CLI]
        StagingCLI -->|HTTPS POST| StagingApp[staging-api.gearup.com]
        StagingApp -->|Verify whsec_test_...| StagingDB[(Staging PostgreSQL)]
    end

    subgraph STAGE_3["Stage 3: Production Cloud"]
        LiveStripeCloud[Stripe Cloud Event Dispatcher] -->|Direct HTTPS POST| ProdIngress[api.gearup.com/api/payments/confirm]
        ProdIngress -->|Verify whsec_live_... or Rolling Secret| ProdApp[Production Express Clustered Instance]
        ProdApp -->|Idempotency Check via WebhookLog| ProdDB[(Production PostgreSQL)]
    end
```

#### Core Architectural Guarantees:
1. **Zero-Code Modification**: The same endpoint (`POST /api/payments/confirm`) and service pipeline handle local Stripe CLI dispatches, staging forwards, and live cloud webhooks.
2. **Raw Body Integrity**: The raw buffer of the Stripe request payload is preserved prior to any JSON parsing middleware.
3. **Strict Idempotency**: Duplicate event deliveries from Stripe (retries, network retransmits) are captured by the `webhook_logs` table and skipped cleanly with `200 OK`.
4. **Zero-Downtime Secret Rotation**: Supports dual-secret verification (`STRIPE_WEBHOOK_SECRET` with fallback to `STRIPE_WEBHOOK_SECRET_ROLLING`) to prevent dropped events during secret updates.

---

### 5.2 Codebase Implementation (`Full_Project_SetUp.md` Pattern)

Following the modular directory structure from `Full_Project_SetUp.md`:

```
src/
├── lib/
│   └── stripe.ts                     # Stripe API singleton
└── modules/
    └── payment/
        ├── payment.interface.ts      # DTOs, query types & response shapes
        ├── payment.service.ts        # Checkout sessions, raw webhook logic & transactions
        ├── payment.controller.ts     # Request extraction, catchAsync & sendResponse
        └── payment.route.ts          # Protected checkout route & raw webhook endpoint
```

#### 1. Stripe Singleton (`src/lib/stripe.ts`)
```ts
// src/lib/stripe.ts
import Stripe from "stripe";
import { config } from "../config";

export const stripe = new Stripe(config.stripe_secret_key, {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});
```

#### 2. Payment Domain Types (`src/modules/payment/payment.interface.ts`)
```ts
// src/modules/payment/payment.interface.ts
import { PaymentStatus, PaymentMethod } from "../../../generated/prisma/enums";

export type TCreateCheckoutPayload = {
  rentalOrderId: string;
};

export type TCheckoutSessionResponse = {
  paymentUrl: string | null;
  sessionId: string;
};

export type TPaymentFilterQuery = {
  page?: string;
  limit?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
};
```

#### 3. Payment Service (`src/modules/payment/payment.service.ts`)
```ts
// src/modules/payment/payment.service.ts
import Stripe from "stripe";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { config } from "../../config";
import { RentalOrderStatus, PaymentStatus, PaymentMethod } from "../../../generated/prisma/enums";

/**
 * 1. Create Dynamic Rental Checkout Session
 * Formats daily rental fees and refundable security deposits into distinct line items
 */
const createRentalCheckoutSession = async (rentalOrderId: string, customerId: string) => {
  const order = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: {
      customer: true,
      items: { include: { gearItem: true } },
    },
  });

  // Verify ownership & order status
  if (order.customerId !== customerId) {
    const err: any = new Error("Forbidden: You cannot pay for another customer's order.");
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    const err: any = new Error("This rental order has already been paid.");
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  if (order.status === RentalOrderStatus.CANCELLED) {
    const err: any = new Error("Cannot pay for a cancelled rental order.");
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  // Construct dynamic line items for Stripe Checkout
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: `${item.gearItem.title} (${order.totalDays} Days Rental)`,
        description: `Brand: ${item.gearItem.brand} | Model: ${item.gearItem.model || "Standard"} | Condition: ${item.gearItem.condition}`,
        images: item.gearItem.images.slice(0, 1),
      },
      unit_amount: Math.round(item.unitPricePerDay * order.totalDays * 100), // Cents conversion
    },
    quantity: item.quantity,
  }));

  // Add Refundable Security Deposit as a distinct line item if configured
  if (order.depositFee > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Refundable Security Deposit Fee",
          description: "100% refundable upon safe return and inspection of equipment.",
        },
        unit_amount: Math.round(order.depositFee * 100),
      },
      quantity: 1,
    });
  }

  // Generate Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: order.customer.email,
    line_items: lineItems,
    success_url: `${config.app_url}/rentals/${order.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/rentals/${order.id}?payment=cancelled`,
    metadata: {
      rentalOrderId: order.id,
      customerId: order.customerId,
      orderNumber: order.orderNumber,
    },
  });

  // Persist initial pending payment record
  await prisma.payment.upsert({
    where: { stripeSessionId: session.id },
    update: {},
    create: {
      transactionId: `txn_${session.id.slice(-14)}`,
      rentalOrderId: order.id,
      customerId: order.customerId,
      amount: order.totalAmount,
      currency: "usd",
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.PENDING,
      stripeSessionId: session.id,
    },
  });

  return { paymentUrl: session.url, sessionId: session.id };
};

/**
 * 2. Universal Webhook Pipeline (Local CLI & Production Cloud)
 * Handles cryptographic signature validation, rolling secret fallback,
 * database idempotency, and atomic order state transitions
 */
const handleWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;

  // A. Cryptographic Signature Verification with Rolling Secret Rotation Fallback
  try {
    event = stripe.webhooks.constructEvent(payload, signature, config.stripe_webhook_secret);
  } catch (primaryErr: any) {
    if (config.stripe_webhook_secret_rolling) {
      try {
        event = stripe.webhooks.constructEvent(payload, signature, config.stripe_webhook_secret_rolling);
      } catch (rollingErr: any) {
        throw new Error(`Stripe signature verification failed: ${primaryErr.message}`);
      }
    } else {
      throw new Error(`Stripe signature verification failed: ${primaryErr.message}`);
    }
  }

  // B. Production Idempotency Guard (Prevents double fulfillment on retries)
  const alreadyHandled = await prisma.webhookLog.findUnique({
    where: { eventId: event.id },
  });

  if (alreadyHandled) {
    console.log(`ℹ️ [Stripe Webhook] Duplicate event ${event.id} detected. Skipping.`);
    return;
  }

  await prisma.webhookLog.create({
    data: { eventId: event.id, eventType: event.type },
  });

  // C. Event Dispatcher
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rentalOrderId = session.metadata?.rentalOrderId;

      if (!rentalOrderId) {
        console.warn(`⚠️ [Webhook] No rentalOrderId found in session ${session.id} metadata.`);
        break;
      }

      await prisma.$transaction(async (tx) => {
        // 1. Mark Payment as PAID
        await tx.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: PaymentStatus.PAID,
            stripePaymentIntentId: session.payment_intent as string,
            paidAt: new Date(),
          },
        });

        // 2. Transition Rental Order from PLACED -> CONFIRMED & PAID
        const order = await tx.rentalOrder.update({
          where: { id: rentalOrderId },
          data: {
            status: RentalOrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PAID,
          },
          include: { items: true },
        });

        // 3. Atomically decrement available stock for reserved gear
        for (const item of order.items) {
          await tx.gearItem.update({
            where: { id: item.gearItemId },
            data: { availableStock: { decrement: item.quantity } },
          });
        }

        console.log(`🎉 [Webhook] Rental Order ${order.orderNumber} successfully confirmed and inventory reserved.`);
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: PaymentStatus.FAILED },
        });

        const payment = await tx.payment.findFirst({
          where: { stripePaymentIntentId: intent.id },
        });

        if (payment) {
          await tx.rentalOrder.update({
            where: { id: payment.rentalOrderId },
            data: { paymentStatus: PaymentStatus.FAILED },
          });
        }
      });
      console.warn(`❌ [Webhook] Payment failed for PaymentIntent ${intent.id}.`);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const intentId = charge.payment_intent as string;

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { stripePaymentIntentId: intentId },
          include: { rentalOrder: { include: { items: true } } },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.REFUNDED },
          });

          await tx.rentalOrder.update({
            where: { id: payment.rentalOrderId },
            data: { paymentStatus: PaymentStatus.REFUNDED, status: RentalOrderStatus.CANCELLED },
          });

          // Restore gear inventory upon refund/cancellation
          for (const item of payment.rentalOrder.items) {
            await tx.gearItem.update({
              where: { id: item.gearItemId },
              data: { availableStock: { increment: item.quantity } },
            });
          }
          console.log(`🔄 [Webhook] Order ${payment.rentalOrder.orderNumber} refunded and stock restored.`);
        }
      });
      break;
    }

    default:
      console.log(`ℹ️ [Webhook] Unhandled event type: ${event.type}`);
  }
};

/**
 * 3. User Payment History & Receipts
 */
const getUserPayments = async (userId: string, role: string, query: { page?: string; limit?: string }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereCondition = role === "ADMIN" ? {} : { customerId: userId };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        rentalOrder: {
          select: { orderNumber: true, startDate: true, endDate: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where: whereCondition }),
  ]);

  return { payments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getPaymentById = async (paymentId: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: {
      rentalOrder: {
        include: {
          items: { include: { gearItem: { select: { title: true, brand: true } } } },
        },
      },
    },
  });

  if (role !== "ADMIN" && payment.customerId !== userId) {
    const err: any = new Error("Forbidden: You do not have access to this payment receipt.");
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  return payment;
};

export const paymentServices = {
  createRentalCheckoutSession,
  handleWebhook,
  getUserPayments,
  getPaymentById,
};
```

#### 4. Payment Controller (`src/modules/payment/payment.controller.ts`)
```ts
// src/modules/payment/payment.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentServices } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { rentalOrderId } = req.body;

  if (!rentalOrderId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "rentalOrderId is required to initiate payment.",
    });
  }

  const result = await paymentServices.createRentalCheckoutSession(rentalOrderId, customerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe checkout session created successfully",
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as Buffer;
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Missing stripe-signature header in webhook request.",
    });
  }

  await paymentServices.handleWebhook(payload, signature);

  // Return prompt HTTP 200 acknowledgment to avoid Stripe retry loops
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Webhook event processed successfully",
    data: null,
  });
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.getUserPayments(req.user!.id, req.user!.role, req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments fetched successfully",
    data: result.payments,
    meta: result.meta,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.getPaymentById(req.params.id, req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment receipt retrieved successfully",
    data: result,
  });
});

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
  getUserPayments,
  getPaymentById,
};
```

#### 5. Payment Routes (`src/modules/payment/payment.route.ts`)
```ts
// src/modules/payment/payment.route.ts
import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Customer creates checkout session for an order
router.post("/create", auth(Role.CUSTOMER), paymentController.createCheckoutSession);

// Public Stripe Webhook listener (validated cryptographically via raw body buffer)
router.post("/confirm", paymentController.handleWebhook);

// Payment audit and receipts
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getUserPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router;
```

#### 6. Express Application Assembly (`src/app.ts`)

> [!CAUTION]
> **CRITICAL WEBHOOK PARSER ORDERING REQUIREMENT**:  
> Stripe signature verification calculates an HMAC SHA-256 digest on the exact raw byte stream of the request payload.  
> You **MUST mount `express.raw({ type: "application/json" })` strictly BEFORE `express.json()`**.

```ts
// src/app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { categoryRoutes } from "./modules/category/category.route";
import { gearRoutes } from "./modules/gear/gear.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reviewRoutes } from "./modules/review/review.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

// 1. CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "https://gearup.yourdomain.com"],
    credentials: true,
  })
);

// 2. ⚠️ Mount Raw Body Parser for Stripe Webhook BEFORE express.json()
app.use("/api/payments/confirm", express.raw({ type: "application/json" }));

// 3. Standard Body Parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4. Base Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GearUp Rental Engine API is running smoothly 🚀",
  });
});

// 5. Mount Application Feature Modules
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// 6. Centralized Error & 404 Handlers (Always at the end)
app.use(notFound);
app.use(globalErrorHandler);

export default app;
```

---

### 5.3 Development Webhook System: Step-by-Step Setup & Testing

Follow these steps on your local machine to test payment and webhook flows from end to end:

#### Dev Step 1: Stripe CLI Installation & Login
1. Install the official Stripe CLI:
   - **Windows (Scoop)**: `scoop install stripe`
   - **Windows (Chocolatey)**: `choco install stripe-cli`
   - **macOS (Homebrew)**: `brew install stripe/stripe-cli/stripe`
2. Authenticate the CLI with your Stripe account:
   ```bash
   stripe login
   ```
   *Follow the browser link to grant CLI permissions.*

#### Dev Step 2: Local Forwarding Listener Configuration
Open a dedicated terminal window and run:
```bash
stripe listen --forward-to localhost:5000/api/payments/confirm
```
*The terminal will output:*
```
> Ready! Your webhook signing secret is whsec_test_0192834756abcdef... (^C to quit)
```
Copy this secret (`whsec_test_...`) and update your local `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_test_0192834756abcdef..."
```

#### Dev Step 3: Test 1 - Instant Synthetic Trigger
Verify that your Express server is reachable and parses raw webhook signatures properly:
```bash
# Terminal 1: Run your server
npm run dev

# Terminal 2: Keep stripe listen running
stripe listen --forward-to localhost:5000/api/payments/confirm

# Terminal 3: Trigger synthetic event
stripe trigger checkout.session.completed
```
**Expected Terminal Output in Terminal 2:**
```
[200] POST http://localhost:5000/api/payments/confirm
```
**Expected Server Log in Terminal 1:**
```
ℹ️ [Webhook] Duplicate event evt_xxx detected. Skipping.  (or initial processing log)
```

#### Dev Step 4: Test 2 - Full End-to-End Browser Checkout Test
1. Log in as a customer via `POST /api/auth/login` to obtain an access token.
2. Place a rental order via `POST /api/rentals`:
   ```json
   {
     "startDate": "2026-09-01T10:00:00Z",
     "endDate": "2026-09-05T18:00:00Z",
     "items": [{ "gearItemId": "<GEAR_UUID>", "quantity": 1 }]
   }
   ```
   *Note the returned `rentalOrderId`.*
3. Generate the checkout session via `POST /api/payments/create`:
   ```json
   {
     "rentalOrderId": "<RENTAL_ORDER_UUID>"
   }
   ```
4. Copy the returned `paymentUrl` and paste it into your browser.
5. In the Stripe Checkout UI, enter the test credentials:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry Date**: Any future date (e.g., `12/28`)
   - **CVC**: `123`
   - **Name**: John Trekkers
6. Click **Pay**. You will be redirected to `${config.app_url}/rentals/<id>?payment=success`.
7. Watch Terminal 2 log `[200] POST http://localhost:5000/api/payments/confirm`.
8. Verify in your database (via `npx prisma studio`):
   - The `RentalOrder` status changed from `PLACED` to `CONFIRMED`.
   - The `RentalOrder` paymentStatus changed from `PENDING` to `PAID`.
   - The `Payment` record status is `PAID` with non-null `stripePaymentIntentId` and `paidAt`.
   - The `GearItem` `availableStock` decreased by 1.

#### Dev Step 5: Test 3 - Idempotency & Duplicate Replay Test
1. Locate the event ID in your Stripe CLI logs or via:
   ```bash
   stripe events list --limit 1
   ```
2. Resend the exact event to your local server:
   ```bash
   stripe events resend evt_xxxxxxxxxxxxx
   ```
3. **Expected Behavior**:
   - The server outputs: `ℹ️ [Stripe Webhook] Duplicate event evt_xxx detected. Skipping.`
   - HTTP response is `200 OK`.
   - The database stock is **NOT** decremented a second time.

#### Dev Step 6: Test 4 - Card Decline / Payment Failure Simulation
1. Initiate a new checkout session.
2. In the checkout page, enter a test card configured for declines:
   - **Card Number**: `4000 0027 6000 3184` (Card Declined)
   - **CVC**: `123`, **Exp**: `12/28`
3. Click **Pay**. The card is declined.
4. Trigger the synthetic failure event via CLI:
   ```bash
   stripe trigger payment_intent.payment_failed
   ```
5. Confirm in your database that the payment record status transitioned to `FAILED`.

---

### 5.4 Production Webhook System: Step-by-Step Deployment & Testing

In production, **never run `stripe listen`**. The Stripe Cloud communicates directly with your deployed API over HTTPS.

#### Prod Step 1: Live Cloud Destination Ingress Registration
1. Deploy your backend application (e.g., Render, Railway, AWS ECS, Vercel) and ensure it has a valid SSL certificate (HTTPS).
2. Open **[Stripe Dashboard](https://dashboard.stripe.com)** $\to$ **Developers** $\to$ **Webhooks** $\to$ Click **"Add destination"** (or "Add endpoint").
3. Set the **Endpoint URL** to your live production endpoint:
   ```
   https://api.gearup.com/api/payments/confirm
   ```
4. Under **"Select events to listen for"**, subscribe to:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **"Add endpoint"**.

#### Prod Step 2: Environment Secrets & Zero-Downtime Rolling Key Setup
1. In the newly created webhook endpoint details page, click **"Reveal"** under **Signing Secret**.
2. Copy the production secret (`whsec_live_...`).
3. Set your production environment variables in your hosting provider's dashboard:
   ```env
   NODE_ENV="production"
   STRIPE_SECRET_KEY="sk_live_51Pxxxxxxxxxxxxxxxxxxxx"
   STRIPE_WEBHOOK_SECRET="whsec_live_primary_key_here..."
   STRIPE_WEBHOOK_SECRET_ROLLING=""
   APP_URL="https://gearup.com"
   ```

#### Prod Step 3: Test 1 - Pre-Flight Reachability & Handshake Test
1. In the Stripe Dashboard under your live webhook endpoint, click **"Send test event"** in the top-right corner.
2. Select `checkout.session.completed`.
3. Click **"Send test event"**.
4. **Verification**:
   - Confirm that the response status shows **`200 OK` (Green badge)**.
   - Response latency is $< 300\text{ms}$.
   - Inspect the response payload: `{ "success": true, "statusCode": 200, "message": "Webhook event processed successfully" }`.

#### Prod Step 4: Test 2 - Live Low-Value Purchase & Refund ($1.00 Test)
1. In your production app, place a rental booking using a test listing priced at $1.00.
2. Complete checkout using a real credit card.
3. Verify that your live PostgreSQL database updates the rental order to `CONFIRMED` and `PAID`.
4. Open **Stripe Dashboard $\to$ Payments**, find the $1.00 charge, and click **"Refund"**.
5. Verify in production application logs that `charge.refunded` is received, the order is marked `REFUNDED`, and the equipment stock is restored.

#### Prod Step 5: Test 3 - Zero-Downtime Secret Rotation Test
When rotating a compromised or expiring webhook secret:
1. In the Stripe Dashboard, click **"Rotate signing secret"**. Stripe will display both an **Immediately active new secret** and an **Expiring current secret (24h grace period)**.
2. Update your production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_live_brand_new_secret..."
   STRIPE_WEBHOOK_SECRET_ROLLING="whsec_live_old_expiring_secret..."
   ```
3. Trigger test events. The code attempts verification against `STRIPE_WEBHOOK_SECRET` first; if it fails, it seamlessly falls back to `STRIPE_WEBHOOK_SECRET_ROLLING`. Zero events are dropped.

#### Prod Step 6: Test 4 - Downtime Recovery & Manual Redelivery Test
If your backend server experiences downtime during a customer checkout:
1. Stripe automatically retries failed deliveries using exponential backoff (over 72 hours).
2. To test manual redelivery:
   - In Stripe Dashboard $\to$ Developers $\to$ Webhooks $\to$ Select Endpoint $\to$ **Event History**.
   - Select any event that failed or succeeded $\to$ Click **"Resend"**.
3. Check production logs (`pm2 logs` or CloudWatch). Verify that the server acknowledges the redelivery cleanly and that the `webhook_logs` table prevents duplicate side effects.

---

### 5.5 Production Best Practices & Common Setup Traps

| # | Common Setup Trap | Root Cause | Preventive Measure |
| :-: | :--- | :--- | :--- |
| **1** | **`Webhook signature verification failed`** | `express.json()` ran before `express.raw()`, mutating the payload buffer. | Keep `app.use("/api/payments/confirm", express.raw({ type: "application/json" }))` at the top of `src/app.ts`. |
| **2** | **Duplicate Stock Decrements** | Not enforcing idempotency on retried Stripe events. | Query `WebhookLog` on `event.id` prior to executing business mutations. |
| **3** | **Stripe 504 Gateway Timeout Retry Loops** | Performing slow long-running tasks before returning HTTP 200. | Send fast HTTP 200 via `sendResponse` within 2 seconds of receipt. |
| **4** | **Running `stripe listen` on Live Cloud Server** | Confusing CLI dev forwarder with cloud webhooks. | Only use `stripe listen` locally. In production, configure the endpoint URL directly in Stripe Dashboard. |
| **5** | **Unhandled Promise Rejections in Webhook** | Throwing uncaught exceptions inside asynchronous event handlers. | Wrap controller in `catchAsync` and catch verification errors inside `try/catch`. |
| **6** | **Dropped Events During Secret Rotation** | Changing secret in `.env` without rolling fallback. | Maintain `STRIPE_WEBHOOK_SECRET_ROLLING` during key transition periods. |

---

*This document serves as the official, standard production blueprint for the GearUp Rental Backend API.*

