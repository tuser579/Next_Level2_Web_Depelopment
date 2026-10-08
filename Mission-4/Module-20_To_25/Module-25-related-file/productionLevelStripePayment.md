# 💳 Production-Grade Stripe Payment System (Architecture & Implementation Guide)

> **Complete Blueprint for Node.js, Express, TypeScript & Prisma ORM**  
> Designed specifically for this project's architecture (`catchAsync`, `sendResponse`, `auth` middleware, Prisma multi-file schemas, and layered services).  
> Covers **One-Time Purchases**, **Recurring SaaS Subscriptions**, **Saved Cards (`SetupIntent`)**, **Refunds**, and **Complete Development & Production Webhook Implementations with Step-by-Step Testing**.

---

## 📑 Table of Contents

1. [Beginner Mental Model: How Payment Works](#1-beginner-mental-model-how-payment-works)
2. [The 4 Payment Types (Which One Fits Your Use Case?)](#2-the-4-payment-types-which-one-fits-your-use-case)
3. [The Golden Rule: Why Webhooks are 100% Mandatory](#3-the-golden-rule-why-webhooks-are-100-mandatory)
4. [Master Architecture & Sequence Diagrams](#4-master-architecture--sequence-diagrams)
5. [Prisma Database Schema Setup](#5-prisma-database-schema-setup)
6. [Environment & Configuration Setup](#6-environment--configuration-setup)
7. [Express App Middleware Configuration (`app.ts`)](#7-express-app-middleware-configuration-appts)
8. [Payment Module Implementation (Project Coding Style)](#8-payment-module-implementation-project-coding-style)
   - [8.1 Helper Utilities (`payment.utils.ts`)](#81-helper-utilities-paymentutilsts)
   - [8.2 Service Layer (`payment.service.ts`)](#82-service-layer-paymentservicets)
   - [8.3 Controller Layer (`payment.controller.ts`)](#83-controller-layer-paymentcontrollerts)
   - [8.4 Route Layer (`payment.route.ts`)](#84-route-layer-paymentroutets)
9. [The Production Webhook Engine (Idempotent & Resilient)](#9-the-production-webhook-engine-idempotent--resilient)
10. [Development vs Production Webhook Systems: Step-by-Step Setup](#10-development-vs-production-webhook-systems-step-by-step-setup)
    - [10.1 Side-by-Side Comparison: Dev vs Production Webhook Architecture](#101-side-by-side-comparison-dev-vs-production-webhook-architecture)
    - [10.2 How to Apply the Development Webhook (Localhost + Stripe CLI)](#102-how-to-apply-the-development-webhook-localhost--stripe-cli)
    - [10.3 How to Apply the Production Webhook (Stripe Dashboard + Remote HTTPS Listener)](#103-how-to-apply-the-production-webhook-stripe-dashboard--remote-https-listener)
    - [10.4 How the Backend Code Seamlessly Handles Both Environments](#104-how-the-backend-code-seamlessly-handles-both-environments)
    - [10.5 Zero-Downtime Secret Rotation Pattern (Dual Secrets in Code)](#105-zero-downtime-secret-rotation-pattern-dual-secrets-in-code)
    - [10.6 Remote CLI Forwarding (Testing Staging / Remote Cloud Servers)](#106-remote-cli-forwarding-testing-staging--remote-cloud-servers)
    - [10.7 Network Perimeter Security & Stripe IP Address Allowlisting](#107-network-perimeter-security--stripe-ip-address-allowlisting)
    - [10.8 Decoupled High-Throughput Processing (Queue Offloading)](#108-decoupled-high-throughput-processing-queue-offloading)
11. [How to TEST BOTH Systems to Verify They Work Correctly](#11-how-to-test-both-systems-to-verify-they-work-correctly)
    - [11.1 Testing the Development Webhook (3 Practical Methods)](#111-testing-the-development-webhook-3-practical-methods)
      - [Test 1: Instant Synthetic CLI Trigger (`stripe trigger`)](#test-1-instant-synthetic-cli-trigger-stripe-trigger)
      - [Test 2: End-to-End Real Simulation (Browser/Postman + Test Cards)](#test-2-end-to-end-real-simulation-browserpostman--test-cards)
      - [Test 3: Idempotency & Duplicate Replay Test](#test-3-idempotency--duplicate-replay-test)
    - [11.2 Testing the Production Webhook (3 Enterprise-Grade Methods)](#112-testing-the-production-webhook-3-enterprise-grade-methods)
      - [Test 1: Pre-Flight Verification via Stripe Dashboard ("Send test event")](#test-1-pre-flight-verification-via-stripe-dashboard-send-test-event)
      - [Test 2: Low-Value Live Real Charge & Immediate Refund ($1.00 Test)](#test-2-low-value-live-real-charge--immediate-refund-100-test)
      - [Test 3: Downtime Simulation & Manual Redelivery ("Resend event")](#test-3-downtime-simulation--manual-redelivery-resend-event)
    - [11.3 Official Stripe Test Cards Table](#113-official-stripe-test-cards-table)
12. [Frontend Integration Examples (React / Next.js)](#12-frontend-integration-examples-react--nextjs)
13. [Top 7 Beginner Traps & Security Checklist](#13-top-7-beginner-traps--security-checklist)
14. [Quick Reference Cheat Sheet](#14-quick-reference-cheat-sheet)

---

## 1. Beginner Mental Model: How Payment Works

If you are new to backend development, handling money online might feel intimidating. Stripe simplifies this through a clear separation of concerns:

> [!IMPORTANT]
> **The PCI-DSS Security Law:**  
> Your backend database and server **must never touch or store raw card numbers, CVVs, or expiration dates**.  
> Stripe securely collects card information directly from the user's browser (via Stripe Elements or Stripe Checkout) and issues your server a safe reference ID (such as `pm_xxx` or `cus_xxx`).

### Real-Life Analogy: The Restaurant Counter 🍽️

| Stripe Term | Real-Life Analogy | Purpose |
| :--- | :--- | :--- |
| **Customer (`cus_xxx`)** | Membership card | Identifies the buyer, stores receipts, default cards, and invoices. |
| **Product & Price (`prod_xxx`, `price_xxx`)** | Menu item & price tag | Defines what you sell (e.g. "$15/month Premium" or "$50 Book"). |
| **PaymentIntent (`pi_xxx`)** | Cashier bill / Order slip | Tracks a payment attempt from `requires_payment_method` to `succeeded`. |
| **Checkout Session (`cs_xxx`)** | Cashier checkout window | A hosted, secure webpage created by Stripe for the buyer to pay. |
| **Subscription (`sub_xxx`)** | Monthly recurring contract | Automatically bills the customer's card on a recurring schedule. |
| **Webhook (`evt_xxx`)** | Certified bank dispatch SMS | Stripe notifying your server: *"The customer's bank approved the charge!"* |

---

## 2. The 4 Payment Types (Which One Fits Your Use Case?)

Any real-world application uses one or more of these 4 models:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Stripe Payment Types                            │
├────────────────────┬────────────────────┬──────────────────┬───────────┤
│ Type 1: One-Time   │ Type 2: Recurring  │ Type 3: Save     │ Type 4:   │
│ Purchases          │ Subscriptions      │ Cards / Setup    │ Refunds   │
│ (E-Commerce/Books) │ (SaaS/Memberships) │ (Uber / Airbnb)  │ & Dispute │
└────────────────────┴────────────────────┴──────────────────┴───────────┘
```

1. **Type 1: One-Time Purchases (`mode: 'payment'`)**
   - *Use Case:* Digital downloads, e-commerce physical orders, pay-per-article, credit bundles.
   - *Behavior:* Charged once. Order is fulfilled when the webhook confirms payment.
2. **Type 2: Recurring Subscriptions (`mode: 'subscription'`)**
   - *Use Case:* SaaS monthly/yearly plans, memberships (e.g., this project's Premium access).
   - *Behavior:* Stripe charges the customer's card periodically (every month/year).
3. **Type 3: Save Card for Future Off-Session Charges (`SetupIntent` / `mode: 'setup'`)**
   - *Use Case:* Ride-sharing (Uber), grocery delivery, or metered cloud billing.
   - *Behavior:* Saves the payment method to the customer profile with zero initial charge ($0 authorization), enabling future programmatic billing.
4. **Type 4: Refunds & Cancellations**
   - *Use Case:* Order cancellations, refund requests, or rolling back entitlements.
   - *Behavior:* Issues a refund via `stripe.refunds.create()` and handles reversal webhooks.

---

## 3. The Golden Rule: Why Webhooks are 100% Mandatory

A very common beginner mistake is trusting the browser redirect:

```
❌ FATAL BEGINNER MISTAKE:
User pays on Stripe -> Redirects to: http://localhost:3000/success?userId=123
Backend route (/api/payment/success) is called -> Marks user as PAID.
```

### Why this crashes in production:
1. **Network Drop / Tab Closed:** If the user closes their browser or their internet drops before the redirect fires, the customer is charged, but your database is **never updated**.
2. **Security Vulnerability:** Any user can open `http://localhost:3000/success?userId=my_id` in their browser and get free access without paying.
3. **Delayed Payment Methods:** Bank transfers (ACH, SEPA, iDEAL) take hours or days to settle. The redirect happens immediately, while the funds haven't cleared yet.

```
✅ THE PRODUCTION STANDARD:
1. Stripe charges the customer's card.
2. Stripe's banking infrastructure sends a cryptographic HTTP POST to YOUR server.
3. Your server validates the signature (`stripe-signature`).
4. Your server updates the database and unlocks access.
```

---

## 4. Master Architecture & Sequence Diagrams

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User (Browser)
    participant Client as Frontend (Next.js / React)
    participant Route as Express Route & Controller
    participant Service as Payment Service
    participant DB as Postgres (Prisma)
    participant Stripe as Stripe API & Gateway

    Note over Customer,Stripe: Phase 1: Initiating Payment
    Customer->>Client: Clicks "Subscribe" or "Buy Now"
    Client->>Route: POST /api/payment/checkout (with JWT Auth)
    Route->>Service: createCheckoutSession(userId, plan)
    Service->>DB: Find or create Stripe Customer ID
    DB-->>Service: cus_123
    Service->>Stripe: stripe.checkout.sessions.create({ customer, mode, metadata })
    Stripe-->>Service: session.url (https://checkout.stripe.com/c/pay/cs_xxx)
    Service-->>Route: Return URL
    Route-->>Client: sendResponse({ statusCode: 200, data: { paymentUrl } })
    Client->>Stripe: Browser redirects to Stripe Checkout

    Note over Customer,Stripe: Phase 2: Checkout Execution
    Customer->>Stripe: Enters Card & Clicks "Pay"
    Stripe->>Stripe: 3D Secure / Bank Authorization
    Stripe-->>Customer: Redirects to success_url (UI shows "Payment Processing...")

    Note over Stripe,DB: Phase 3: The Authoritative Webhook
    Stripe->>Route: POST /api/payment/webhook (with stripe-signature)
    Route->>Service: handleWebhook(payloadBuffer, signature)
    Service->>Service: Verify Signature (HMAC-SHA256)
    Service->>DB: Check WebhookLog table (Idempotency)
    alt Already Processed
        Service-->>Route: Skip Duplicate
    else New Event
        Service->>DB: Update Subscription or Order in Transaction
        Service->>DB: Create WebhookLog record
        Service-->>Route: Completed
    end
    Route-->>Stripe: HTTP 200 OK (Fast acknowledgement within 3s)
```

---

## 5. Prisma Database Schema Setup

This project uses Prisma multi-file schemas located in `prisma/schema/`. Let's define the models following the project's exact style (`@@map`, `@@index`, uuid IDs, enums).

### 5.1 Enums: `prisma/schema/enums.prisma`
```prisma
// Append to prisma/schema/enums.prisma

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAST_DUE
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentType {
  ONE_TIME
  SUBSCRIPTION
}
```

### 5.2 Subscription Model: `prisma/schema/subscription.prisma`
```prisma
model Subscription {
    id                   String             @id @default(uuid())
    userId               String             @unique
    user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)

    currentPeriodEnd     DateTime
    status               SubscriptionStatus @default(ACTIVE) 

    // Stripe Identifiers
    stripeCustomerId     String             @unique
    stripeSubscriptionId String             @unique

    createdAt            DateTime           @default(now())
    updatedAt            DateTime           @updatedAt

    @@index([userId])
    @@index([stripeSubscriptionId])
    @@map("subscriptions")
}
```

### 5.3 Order Model (For One-Time Purchases): `prisma/schema/order.prisma`
```prisma
model Order {
    id                      String      @id @default(uuid())
    userId                  String
    user                    User        @relation(fields: [userId], references: [id], onDelete: Cascade)

    amountInCents           Int
    currency                String      @default("usd")
    status                  OrderStatus @default(PENDING)
    title                   String

    stripePaymentIntentId   String?     @unique
    stripeCheckoutSessionId String?     @unique

    createdAt               DateTime    @default(now())
    updatedAt               DateTime    @updatedAt

    @@index([userId])
    @@index([stripePaymentIntentId])
    @@index([stripeCheckoutSessionId])
    @@map("orders")
}
```

### 5.4 Webhook Idempotency Log: `prisma/schema/webhookLog.prisma`
```prisma
// Crucial for production: guarantees no webhook event is processed twice
model WebhookLog {
    id          String   @id @default(uuid())
    eventId     String   @unique // "evt_xxx" from Stripe
    eventType   String   // e.g. "checkout.session.completed"
    processedAt DateTime @default(now())

    @@index([eventId])
    @@map("webhook_logs")
}
```

> **Run migration:**
> ```bash
> npx prisma migrate dev --name add_payment_orders_and_webhook_logs
> npx prisma generate
> ```

---

## 6. Environment & Configuration Setup

### 6.1 `.env` File (Dev & Production Templates)

#### In Local Development (`.env`):
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/prisma_press?schema=public"
APP_URL="http://localhost:3000"

# Stripe Test Keys
STRIPE_SECRET_KEY="your_stripe_test_secret_key_here"
# ⚠️ In local dev: generated by the terminal when running `stripe listen`
STRIPE_WEBHOOK_SECRET="whsec_cli_abcdef1234567890..."

# Stripe Price IDs for Subscriptions (From Stripe Dashboard -> Products)
STRIPE_PRODUCT_PRICE_ID="price_1Qxxxxxxxxxxxxxxxx"
STRIPE_YEARLY_PRICE_ID="price_1Qyyyyyyyyyyyyyyyy"
```

#### In Live Production Server Environment Variables:
```env
PORT=5000
DATABASE_URL="postgresql://db_user:secure_pwd@production-db.host:5432/prisma_press?schema=public"
APP_URL="https://yourfrontend.com"

# Stripe Live Keys
STRIPE_SECRET_KEY="your_stripe_live_secret_key_here"
# ⚠️ In production: copied from Stripe Dashboard -> Developers -> Webhooks
STRIPE_WEBHOOK_SECRET="whsec_dashboard_live_abcdef123456..."

# Optional rolling secret for zero-downtime rotation
STRIPE_WEBHOOK_SECRET_ROLLING=""

STRIPE_PRODUCT_PRICE_ID="price_live_1Qxxxxxxxxxxxxxxxx"
STRIPE_YEARLY_PRICE_ID="price_live_1Qyyyyyyyyyyyyyyyy"
```

### 6.2 Project Config: `src/config/index.ts`
```ts
// src/config/index.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
    app_url: process.env.APP_URL || "http://localhost:3000",
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    
    // Stripe Config
    stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    stripe_webhook_secret_rolling: process.env.STRIPE_WEBHOOK_SECRET_ROLLING || "",
    stripe_product_price_id: process.env.STRIPE_PRODUCT_PRICE_ID!,
    stripe_yearly_price_id: process.env.STRIPE_YEARLY_PRICE_ID,
};
```

### 6.3 Stripe Singleton: `src/lib/stripe.ts`
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

## 7. Express App Middleware Configuration (`app.ts`)

> [!CAUTION]
> **The #1 Webhook Bug in Express:**  
> `app.use(express.json())` parses raw HTTP bodies into JavaScript objects. If the webhook URL passes through `express.json()`, the raw binary buffer is lost and `stripe.webhooks.constructEvent()` will fail with a signature verification error!

Here is how `src/app.ts` must configure raw parsing for the webhook route:

```ts
// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { paymentRoutes } from "./modules/payment/payment.route";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

app.use(cors({
    origin: ["http://localhost:3000", "https://yourfrontend.com"],
    credentials: true
}));

// ---------------------------------------------------------------------
// ⚠️ STEP 1: Mount the Webhook RAW parser BEFORE express.json()
// ---------------------------------------------------------------------
app.use(
    "/api/payment/webhook",
    express.raw({ type: "application/json" })
);
app.use(
    "/api/subscription/webhook",
    express.raw({ type: "application/json" })
);

// ---------------------------------------------------------------------
// ⚠️ STEP 2: Standard Body Parsers for all normal JSON routes
// ---------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Application API routes
app.use("/api/payment", paymentRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Error handlers
app.use(notFound);
app.use(globalErrorHandler);

export default app;
```

---

## 8. Payment Module Implementation (Project Coding Style)

Let's build `src/modules/payment/` strictly following this repository's architectural patterns:
- Using `catchAsync` & `sendResponse` from `../../utils/`
- Using `httpStatus` from `http-status`
- Using `auth(Role.USER, Role.ADMIN, Role.AUTHOR)`
- Using `prisma.$transaction(...)`
- Exporting objects: `paymentServices`, `paymentController`, `paymentRoutes`

### 8.1 Helper Utilities (`payment.utils.ts`)

```ts
// src/modules/payment/payment.utils.ts
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

/**
 * 1. Ensure Customer ID exists in DB and Stripe
 */
export const getOrCreateStripeCustomerId = async (userId: string): Promise<string> => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { subscription: true }
    });

    if (user.subscription?.stripeCustomerId) {
        return user.subscription.stripeCustomerId;
    }

    // Create a new Customer on Stripe
    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
            userId: user.id
        }
    });

    return customer.id;
};

/**
 * 2. Safely calculate current period end timestamp
 */
export const getPeriodEndDate = (payload: Stripe.Subscription): Date => {
    const currentPeriodEndInSeconds = payload.items.data[0]?.current_period_end 
        || (payload as any).current_period_end;
        
    return new Date(currentPeriodEndInSeconds * 1000);
};

/**
 * 3. Map Stripe subscription statuses to our Prisma SubscriptionStatus Enum
 */
export const mapStripeStatusToPrisma = (stripeStatus: Stripe.Subscription.Status): SubscriptionStatus => {
    switch (stripeStatus) {
        case "active":
        case "trialing":
            return SubscriptionStatus.ACTIVE;
        case "canceled":
            return SubscriptionStatus.CANCELLED;
        case "past_due":
        case "unpaid":
            return SubscriptionStatus.PAST_DUE;
        default:
            return SubscriptionStatus.EXPIRED;
    }
};
```

---

### 8.2 Service Layer (`payment.service.ts`)

```ts
// src/modules/payment/payment.service.ts
import Stripe from "stripe";
import { config } from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { 
    getOrCreateStripeCustomerId, 
    getPeriodEndDate, 
    mapStripeStatusToPrisma 
} from "./payment.utils";
import { OrderStatus, SubscriptionStatus } from "../../../generated/prisma/enums";

// ============================================================================
// 1. ONE-TIME CHECKOUT (E-Commerce / Digital Goods / Credits)
// ============================================================================
const createOneTimeCheckoutSession = async (userId: string, payload: { title: string; amountInCents: number }) => {
    return await prisma.$transaction(async (tx) => {
        const customerId = await getOrCreateStripeCustomerId(userId);

        // 1. Create a PENDING order record in DB
        const order = await tx.order.create({
            data: {
                userId,
                title: payload.title,
                amountInCents: payload.amountInCents,
                currency: "usd",
                status: OrderStatus.PENDING,
            }
        });

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer: customerId,
            allowed_payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: payload.title,
                        },
                        unit_amount: payload.amountInCents, // e.g. 2000 = $20.00
                    },
                    quantity: 1,
                }
            ],
            success_url: `${config.app_url}/payment/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.app_url}/payment/cancel?order_id=${order.id}`,
            metadata: {
                paymentType: "ONE_TIME",
                orderId: order.id,
                userId: userId,
            }
        });

        // 3. Save session ID to order
        await tx.order.update({
            where: { id: order.id },
            data: { stripeCheckoutSessionId: session.id }
        });

        return { paymentUrl: session.url };
    });
};

// ============================================================================
// 2. RECURRING SUBSCRIPTION CHECKOUT (SaaS Membership)
// ============================================================================
const createSubscriptionSession = async (userId: string, planType?: "monthly" | "yearly") => {
    return await prisma.$transaction(async (tx) => {
        const customerId = await getOrCreateStripeCustomerId(userId);

        const priceId = planType === "yearly" && config.stripe_yearly_price_id
            ? config.stripe_yearly_price_id
            : config.stripe_product_price_id;

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            allowed_payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                }
            ],
            success_url: `${config.app_url}/premium?success=true`,
            cancel_url: `${config.app_url}/premium?success=false`,
            metadata: {
                paymentType: "SUBSCRIPTION",
                userId: userId,
            }
        });

        return { paymentUrl: session.url };
    });
};

// ============================================================================
// 3. DIRECT PAYMENT INTENT (Custom UI with Stripe Elements)
// ============================================================================
const createPaymentIntent = async (userId: string, amountInCents: number) => {
    const customerId = await getOrCreateStripeCustomerId(userId);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        metadata: {
            userId,
            paymentType: "PAYMENT_INTENT",
        }
    });

    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
    };
};

// ============================================================================
// 4. SETUP INTENT (Save Card for Off-Session Charges - Uber/Airbnb Model)
// ============================================================================
const createSetupIntent = async (userId: string) => {
    const customerId = await getOrCreateStripeCustomerId(userId);

    const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
        usage: "off_session", // We will charge this card in the background later
    });

    return {
        clientSecret: setupIntent.client_secret
    };
};

// ============================================================================
// 5. CHARGE SAVED CARD PROGRAMMATICALLY (Off-Session Charge)
// ============================================================================
const chargeSavedCard = async (userId: string, paymentMethodId: string, amountInCents: number) => {
    const customerId = await getOrCreateStripeCustomerId(userId);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
    });

    return paymentIntent;
};

// ============================================================================
// 6. CANCEL SUBSCRIPTION (Standard SaaS - Cancel at Period End)
// ============================================================================
const cancelSubscription = async (userId: string) => {
    const subscription = await prisma.subscription.findUniqueOrThrow({
        where: { userId }
    });

    if (!subscription.stripeSubscriptionId) {
        throw new Error("No active Stripe subscription found for user");
    }

    // Update Stripe to stop auto-renewal at period end
    const updatedStripeSub = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
    );

    return {
        message: "Subscription will cancel at the end of the current billing period",
        currentPeriodEnd: new Date(updatedStripeSub.current_period_end * 1000)
    };
};

// ============================================================================
// 7. ISSUE PROGRAMMATIC REFUND
// ============================================================================
const createRefund = async (orderId: string) => {
    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId }
    });

    if (!order.stripePaymentIntentId) {
        throw new Error("Cannot refund an order without a Stripe PaymentIntent ID");
    }

    const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
    });

    await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUNDED }
    });

    return refund;
};

// ============================================================================
// 8. THE BULLETPROOF WEBHOOK PROCESSOR (Signature + Idempotency)
// ============================================================================
const handleWebhook = async (payload: Buffer, signature: string) => {
    let event: Stripe.Event;

    // A. Verify cryptographic signature (With Zero-Downtime Secret Rotation support)
    try {
        event = stripe.webhooks.constructEvent(
            payload, 
            signature, 
            config.stripe_webhook_secret
        );
    } catch (primaryErr: any) {
        // Fallback: Check if rolling secret is configured and matches
        if (config.stripe_webhook_secret_rolling) {
            try {
                event = stripe.webhooks.constructEvent(
                    payload,
                    signature,
                    config.stripe_webhook_secret_rolling
                );
            } catch (rollingErr: any) {
                console.error(`⚠️ Webhook signature failed on both primary and rolling secrets`);
                throw new Error(`Webhook verification error: ${primaryErr.message}`);
            }
        } else {
            console.error(`⚠️ Webhook signature verification failed: ${primaryErr.message}`);
            throw new Error(`Webhook verification error: ${primaryErr.message}`);
        }
    }

    // B. Production Idempotency Check (Check if already processed)
    const isAlreadyHandled = await prisma.webhookLog.findUnique({
        where: { eventId: event.id }
    });

    if (isAlreadyHandled) {
        console.log(`ℹ️ [Webhook] Duplicate event ${event.id} received. Skipping.`);
        return;
    }

    // C. Record event in WebhookLog
    await prisma.webhookLog.create({
        data: {
            eventId: event.id,
            eventType: event.type
        }
    });

    // D. Event Dispatcher
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleWebhookCheckoutCompleted(session);
            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            await handleWebhookInvoicePaymentSucceeded(invoice);
            break;
        }

        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            await handleWebhookInvoicePaymentFailed(invoice);
            break;
        }

        case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            await handleWebhookSubscriptionUpdated(sub);
            break;
        }

        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await handleWebhookSubscriptionDeleted(sub);
            break;
        }

        case "payment_intent.payment_failed": {
            const pi = event.data.object as Stripe.PaymentIntent;
            await handleWebhookPaymentIntentFailed(pi);
            break;
        }

        default:
            console.log(`ℹ️ [Webhook] Unhandled event type: ${event.type}`);
    }
};

// ----------------------------------------------------------------------------
// Internal Webhook Handlers
// ----------------------------------------------------------------------------
const handleWebhookCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const paymentType = session.metadata?.paymentType;
    const userId = session.metadata?.userId;

    // Handle One-Time Order Fulfillment
    if (paymentType === "ONE_TIME" && session.metadata?.orderId) {
        const orderId = session.metadata.orderId;
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.PAID,
                stripePaymentIntentId: session.payment_intent as string
            }
        });
        console.log(`✅ [Webhook] Order ${orderId} marked as PAID`);
        return;
    }

    // Handle Initial Subscription Activation
    if (paymentType === "SUBSCRIPTION" || session.mode === "subscription") {
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
            console.error("❌ [Webhook] Missing fields in checkout session metadata");
            return;
        }

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const currentPeriodEnd = getPeriodEndDate(stripeSub);

        await prisma.subscription.upsert({
            where: { userId },
            update: {
                stripeCustomerId,
                stripeSubscriptionId,
                currentPeriodEnd,
                status: SubscriptionStatus.ACTIVE,
            },
            create: {
                userId,
                stripeCustomerId,
                stripeSubscriptionId,
                currentPeriodEnd,
                status: SubscriptionStatus.ACTIVE,
            }
        });

        console.log(`🎉 [Webhook] Subscription activated for user ${userId}`);
    }
};

const handleWebhookInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
    const stripeSubscriptionId = invoice.subscription as string;
    if (!stripeSubscriptionId) return;

    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const currentPeriodEnd = getPeriodEndDate(stripeSub);

    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd
        }
    });

    console.log(`🔄 [Webhook] Subscription renewal succeeded for ${stripeSubscriptionId}`);
};

const handleWebhookInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
    const stripeSubscriptionId = invoice.subscription as string;
    if (!stripeSubscriptionId) return;

    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
            status: SubscriptionStatus.PAST_DUE
        }
    });

    console.warn(`⚠️ [Webhook] Renewal invoice failed for subscription: ${stripeSubscriptionId}`);
};

const handleWebhookSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
    const stripeSubscriptionId = subscription.id;
    const currentPeriodEnd = getPeriodEndDate(subscription);
    const mappedStatus = mapStripeStatusToPrisma(subscription.status);

    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
            status: mappedStatus,
            currentPeriodEnd
        }
    });

    console.log(`📝 [Webhook] Subscription ${stripeSubscriptionId} updated to ${mappedStatus}`);
};

const handleWebhookSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: SubscriptionStatus.CANCELLED
        }
    });

    console.log(`🛑 [Webhook] Subscription ${subscription.id} cancelled permanently`);
};

const handleWebhookPaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.FAILED }
        });
        console.warn(`❌ [Webhook] Order ${orderId} marked as FAILED`);
    }
};

export const paymentServices = {
    createOneTimeCheckoutSession,
    createSubscriptionSession,
    createPaymentIntent,
    createSetupIntent,
    chargeSavedCard,
    cancelSubscription,
    createRefund,
    handleWebhook
};
```

---

### 8.3 Controller Layer (`payment.controller.ts`)

```ts
// src/modules/payment/payment.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentServices } from "./payment.service";

const createOneTimeCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const { title, amountInCents } = req.body;

    if (!amountInCents || amountInCents <= 0) {
        throw new Error("amountInCents must be greater than zero");
    }

    const result = await paymentServices.createOneTimeCheckoutSession(userId, {
        title: title || "Purchase",
        amountInCents: Number(amountInCents)
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "One-time checkout session created successfully",
        data: result
    });
});

const createSubscriptionSession = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const { planType } = req.body; // "monthly" | "yearly"

    const result = await paymentServices.createSubscriptionSession(userId, planType);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription checkout session created successfully",
        data: result
    });
});

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const { amountInCents } = req.body;

    const result = await paymentServices.createPaymentIntent(userId, Number(amountInCents));

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "PaymentIntent created successfully",
        data: result
    });
});

const createSetupIntent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const result = await paymentServices.createSetupIntent(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "SetupIntent created successfully",
        data: result
    });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    const result = await paymentServices.cancelSubscription(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription cancellation requested successfully",
        data: result
    });
});

const createRefund = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const result = await paymentServices.createRefund(orderId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Refund processed successfully",
        data: result
    });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Missing stripe-signature header"
        });
    }

    await paymentServices.handleWebhook(payload, signature);

    // Always acknowledge Stripe with 200 OK
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Webhook processed successfully",
        data: null
    });
});

export const paymentController = {
    createOneTimeCheckoutSession,
    createSubscriptionSession,
    createPaymentIntent,
    createSetupIntent,
    cancelSubscription,
    createRefund,
    handleWebhook
};
```

---

### 8.4 Route Layer (`payment.route.ts`)

```ts
// src/modules/payment/payment.route.ts
import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

// ----------------------------------------------------------------------------
// 1. One-Time Payment Checkout
// ----------------------------------------------------------------------------
router.post(
    "/checkout-one-time",
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    paymentController.createOneTimeCheckoutSession
);

// ----------------------------------------------------------------------------
// 2. Subscription Checkout
// ----------------------------------------------------------------------------
router.post(
    "/checkout-subscription",
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    paymentController.createSubscriptionSession
);

// ----------------------------------------------------------------------------
// 3. Custom PaymentIntent & SetupIntent (Elements UI)
// ----------------------------------------------------------------------------
router.post(
    "/create-payment-intent",
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    paymentController.createPaymentIntent
);

router.post(
    "/create-setup-intent",
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    paymentController.createSetupIntent
);

// ----------------------------------------------------------------------------
// 4. Cancel Subscription
// ----------------------------------------------------------------------------
router.patch(
    "/cancel-subscription",
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    paymentController.cancelSubscription
);

// ----------------------------------------------------------------------------
// 5. Refund (Admin Only)
// ----------------------------------------------------------------------------
router.post(
    "/refund",
    auth(Role.ADMIN),
    paymentController.createRefund
);

// ----------------------------------------------------------------------------
// 6. Stripe Webhook Listener (No auth middleware - Stripe uses signature)
// ----------------------------------------------------------------------------
router.post(
    "/webhook",
    paymentController.handleWebhook
);

export const paymentRoutes = router;
```

---

## 9. The Production Webhook Engine (Idempotent & Resilient)

### Why Idempotency is Critical
Stripe guarantees **at-least-once delivery**. If network latency exceeds Stripe's 10-second timeout, Stripe retries sending the same event **for up to 72 hours**.

Without idempotency:
- A user could be charged or granted duplicate tokens/credits.
- Duplicate invoices or emails would spam customers.

```mermaid
flowchart TD
    A[Stripe Webhook POST] --> B{Verify Signature with Endpoint Secret}
    B -- Invalid --> C[Throw Error 400 - Reject]
    B -- Valid --> D{Query WebhookLog table by eventId}
    D -- Found Duplicate --> E[Log info & Return HTTP 200 - Skip Execution]
    D -- Not Found --> F[Insert eventId into WebhookLog]
    F --> G{Route Event Type}
    G --> H[Update DB in Prisma Transaction]
    H --> I[Return HTTP 200 Fast]
```

---

## 10. Development vs Production Webhook Systems: Step-by-Step Setup

A major point of confusion for developers is:  
*"How do I configure the webhook in Development (localhost) versus Production (Live cloud VPS/Container), and do I need to change my code?"*

The answer is: **Your backend code never changes!** Only the environment variables and the network ingress mechanism differ.

---

### 10.1 Side-by-Side Comparison: Dev vs Production Webhook Architecture

```mermaid
flowchart TD
    subgraph DEV_ENV["🖥️ Local Development Environment"]
        DevStripe[Stripe Test Gateway] <--> |WebSocket Tunnel| CLI[Stripe CLI Process]
        CLI --> |HTTP POST| LocalServer[Local Express Server localhost:5000]
        LocalServer --> LocalDB[(Local Postgres DB)]
    end

    subgraph PROD_ENV["☁️ Production Cloud Environment"]
        ProdStripe[Stripe Live Gateway] --> |Direct HTTPS POST| Nginx[Public Domain / Cloudflare HTTPS]
        Nginx --> ProdServer[Production Express Cluster :5000]
        ProdServer --> ProdDB[(Production Postgres DB)]
    end
```

| Feature | 🛠️ Development Webhook | 🚀 Production Webhook |
| :--- | :--- | :--- |
| **API Keys** | `sk_test_...` (Test Mode) | `sk_live_...` (Live Mode) |
| **Server Ingress** | `localhost:5000` via **Stripe CLI WebSocket** | Public Domain: `https://api.yourdomain.com/api/payment/webhook` |
| **Background Process** | `stripe listen --forward-to localhost:5000/...` | **None!** (Never run CLI on production servers) |
| **Webhook Secret** | Ephemeral, generated in terminal (`whsec_cli_...`) | Permanent, generated in **Stripe Dashboard** (`whsec_live_...`) |
| **SSL / HTTPS** | Plain HTTP is allowed on localhost | **Strict HTTPS** required by Stripe |

---

### 10.2 How to Apply the Development Webhook (Localhost + Stripe CLI)

Follow these exact steps to run webhooks on your local machine:

#### Step 1: Start your local backend
```bash
npm run dev
# Server running on http://localhost:5000
```

#### Step 2: Login to Stripe CLI
Open a second terminal window:
```bash
stripe login
```
*(Press Enter to authorize your test account in your browser)*

#### Step 3: Start the local listener
```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```
Stripe CLI will output your local webhook secret:
```
> Ready! Your webhook signing secret is whsec_test_3a8b9c0d1e2f... (^C to quit)
```

#### Step 4: Add the secret to your local `.env`
```env
STRIPE_WEBHOOK_SECRET="whsec_test_3a8b9c0d1e2f..."
```
Restart your local server so it reads the new `.env` value. Your local webhook pipeline is now 100% active!

---

### 10.3 How to Apply the Production Webhook (Stripe Dashboard + Remote HTTPS Listener)

When deploying to production (AWS, DigitalOcean, Render, Railway, Docker, Vercel):

#### Step 1: Deploy your backend to a public HTTPS domain
Ensure your server is live and responds over HTTPS:
```
https://api.yourdomain.com
```

#### Step 2: Open Stripe Dashboard Webhooks
1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks).
2. Ensure you are in **Live Mode** (toggle switch in top-right corner).
3. Click **"Add an endpoint"** (or **"Add destination"**).

#### Step 3: Configure Endpoint URL
- **Endpoint URL:** `https://api.yourdomain.com/api/payment/webhook`
- **Description:** `Production API Server Webhook Listener`
- **Version:** Latest API version

#### Step 4: Select Events (Whitelisting)
Never select *"Listen to all events"*. Select only what your server processes:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.payment_failed`
- `charge.refunded`

Click **Add endpoint**.

#### Step 5: Copy the Production Signing Secret
1. On the new webhook details page, locate the **Signing secret** card.
2. Click **"Reveal"**.
3. Copy the string starting with `whsec_...` (e.g. `whsec_live_abcdef123...`).

#### Step 6: Set in Production Environment Variables
In your cloud host (e.g., AWS Parameter Store, Render Environment, Docker `.env`):
```env
NODE_ENV=production
STRIPE_SECRET_KEY="your_stripe_live_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_live_abcdef123..."
```
Redeploy or restart your production container. Your production webhook listener is live!

---

### 10.4 How the Backend Code Seamlessly Handles Both Environments

Notice that our [`src/modules/payment/payment.service.ts`](#82-service-layer-paymentservicets) code contains **zero hardcoded `if (isDev)` statements**:

```ts
// Handles BOTH Dev and Prod identically!
const handleWebhook = async (payload: Buffer, signature: string) => {
    // In Dev: config.stripe_webhook_secret is whsec_cli_...
    // In Prod: config.stripe_webhook_secret is whsec_live_...
    const event = stripe.webhooks.constructEvent(
        payload, 
        signature, 
        config.stripe_webhook_secret
    );
    // ...
};
```
Because the signature is verified using `config.stripe_webhook_secret`, your code is 100% portable between localhost and live servers without changing a single line!

---

### 10.5 Zero-Downtime Secret Rotation Pattern (Dual Secrets in Code)

If a production secret is leaked or periodically rotated, rotating it in the Stripe Dashboard will briefly cause in-flight requests to fail.

To achieve **Zero-Downtime Secret Rotation**:
1. In Stripe Dashboard, click **Roll Secret**. Stripe leaves the old secret active for 24 hours.
2. Set both secrets in production:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_new_secret..."
   STRIPE_WEBHOOK_SECRET_ROLLING="whsec_old_expiring_secret..."
   ```
3. Our service code in [Section 8.2](#82-service-layer-paymentservicets) tries `STRIPE_WEBHOOK_SECRET` first, and automatically falls back to `STRIPE_WEBHOOK_SECRET_ROLLING` before rejecting any payload!

---

### 10.6 Remote CLI Forwarding (Testing Staging / Remote Cloud Servers)

If your app is deployed to a remote **staging server** (e.g. `https://staging-api.myproject.com`), you can test it directly using the Stripe CLI without needing local tunnels:

```bash
# Forward events directly to your remote staging server
stripe listen --forward-to https://staging-api.myproject.com/api/payment/webhook

# Forward with custom authorization or security bypass headers
stripe listen \
  --forward-to https://staging-api.myproject.com/api/payment/webhook \
  --headers "X-Staging-Auth: staging_secret_token"
```

---

### 10.7 Network Perimeter Security & Stripe IP Address Allowlisting

If your production server uses a strict firewall or Nginx reverse proxy, allowlist Stripe's official webhook IP ranges:
- Official IP list: [https://stripe.com/files/ips/ips_webhooks.txt](https://stripe.com/files/ips/ips_webhooks.txt)

#### Example: Nginx IP Allowlist Configuration
```nginx
# /etc/nginx/conf.d/stripe_webhook.conf
location /api/payment/webhook {
    allow 3.18.12.63;
    allow 3.130.192.231;
    allow 13.235.14.237;
    allow 13.235.122.149;
    allow 18.211.135.69;
    allow 35.154.171.200;
    allow 52.15.183.38;
    allow 54.88.130.119;
    allow 54.88.130.237;
    allow 54.187.174.169;
    allow 54.187.205.235;
    allow 54.187.216.72;
    deny all;

    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

### 10.8 Decoupled High-Throughput Processing (Queue Offloading)

In high-volume applications, never run heavy email or PDF generation synchronously in the webhook handler. Offload tasks to **BullMQ / Redis**:

```mermaid
flowchart LR
    Stripe[Stripe Webhook POST] --> API[Express Ingestion API]
    API --> FastCheck{Verify & Deduplicate}
    FastCheck --> FastReturn[Return HTTP 200 OK in 30ms!]
    FastCheck --> Queue[(Redis BullMQ Queue)]
    Queue --> Worker[Background Worker Process]
    Worker --> DB[(Postgres Database)]
    Worker --> Email[SendGrid / AWS SES Email]
```

---

## 11. How to TEST BOTH Systems to Verify They Work Correctly

Before launching, you must thoroughly test both environments to ensure zero double-charges, zero dropped webhooks, and 100% database consistency.

---

### 11.1 Testing the Development Webhook (3 Practical Methods)

#### Test 1: Instant Synthetic CLI Trigger (`stripe trigger`)
The fastest way to test if your endpoint receives, verifies, and acknowledges an event.

1. Keep your local Express server running on port 5000.
2. In terminal 2, ensure `stripe listen --forward-to localhost:5000/api/payment/webhook` is active.
3. In terminal 3, run:
   ```bash
   stripe trigger checkout.session.completed
   ```
4. **Expected Output:**
   - Terminal 2 (Stripe CLI):
     ```
     2026-10-08 20:55:00 [200] POST http://localhost:5000/api/payment/webhook
     ```
   - Terminal 1 (Server Logs):
     ```
     ✅ [Webhook] Event checkout.session.completed received and verified!
     ```

---

#### Test 2: End-to-End Real Simulation (Browser/Postman + Test Cards)
Verifies the complete real-world flow from user click to database update.

```
Step 1: Get Auth Token ➔ Step 2: Create Checkout ➔ Step 3: Pay on Stripe ➔ Step 4: Webhook Fires ➔ Step 5: DB Updates
```

1. **Call Checkout API via Postman / Client:**
   ```http
   POST http://localhost:5000/api/payment/checkout-subscription
   Authorization: Bearer <your_jwt_access_token>
   Content-Type: application/json

   { "planType": "monthly" }
   ```
2. **Copy `paymentUrl` from response** and open it in your browser.
3. **Fill in Stripe Checkout:**
   - Card Number: `4242 4242 4242 4242`
   - Exp: Any future date (e.g. `12/28`)
   - CVC: `123`
   - Click **Subscribe**.
4. **Watch the Webhook Fire:**
   - Stripe CLI prints: `[200] POST http://localhost:5000/api/payment/webhook`.
5. **Verify Database in Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   - Check the `subscriptions` table: `status` is now `ACTIVE`, `currentPeriodEnd` is 30 days in the future!
   - Check the `webhook_logs` table: a new entry for `evt_xxx` is logged!

---

#### Test 3: Idempotency & Duplicate Replay Test
Verifies that your server will **never** double-process duplicate webhook deliveries.

1. Using Postman or cURL, send the exact same webhook payload and signature a second time.
2. **Expected Server Response:**
   ```
   ℹ️ [Webhook] Duplicate event evt_123456 received. Skipping.
   HTTP 200 OK
   ```
3. **Database Check:** No duplicate order or subscription record is created.

---

### 11.2 Testing the Production Webhook (3 Enterprise-Grade Methods)

---

#### Test 1: Pre-Flight Verification via Stripe Dashboard ("Send test event")
Test your live URL reachability from Stripe's cloud without spending any money or creating test accounts.

1. Go to **Stripe Dashboard ➔ Developers ➔ Webhooks**.
2. Click on your live production endpoint (`https://api.yourdomain.com/api/payment/webhook`).
3. Click the **"Send test event"** button in the top right.
4. Select `checkout.session.completed`.
5. Click **"Send test event"**.
6. **Inspect the Result Table:**
   - **Response Code:** Must show `200 OK` (Green badge).
   - **Response Time:** Should be `< 300ms`.
   - **Response Body:** `{"statusCode": 200, "success": true, "message": "Webhook processed successfully"}`.
   - *If it shows `400 Bad Request`: Your `STRIPE_WEBHOOK_SECRET` in production `.env` is incorrect or `express.raw()` is misconfigured.*

---

#### Test 2: Low-Value Live Real Charge & Immediate Refund ($1.00 Test)
The definitive test before opening your site to public customers.

1. Create a live hidden product in Stripe Dashboard for **$1.00**.
2. Go to your live production website and perform a real checkout using your own real debit/credit card.
3. Complete the $1.00 purchase.
4. **Verification Checklist:**
   - Check your live production database: The user account is unlocked.
   - Check live server logs (`pm2 logs` / CloudWatch): Confirm event processed.
   - Check Stripe Dashboard ➔ Payments: Confirm $1.00 payment succeeded.
5. **Issue Immediate Refund:**
   - In Stripe Dashboard ➔ Payments ➔ Click the payment ➔ Click **Refund**.
   - Your webhook receives `charge.refunded` and automatically revokes access.
   - Net cost to you: $0.00!

---

#### Test 3: Downtime Simulation & Manual Redelivery ("Resend event")
Simulates a scenario where your production server was temporarily down or restarting during a customer checkout.

1. In Stripe Dashboard ➔ Developers ➔ Webhooks ➔ Select Endpoint ➔ Open **Event history**.
2. Click any completed or failed event.
3. Click the **"Resend"** button (top right).
4. Select your production endpoint and confirm.
5. Verify in your production server logs that the event arrived, verified successfully, and executed without error.

---

### 11.3 Official Stripe Test Cards Table

Use these cards to test every edge case in local development:

| Test Scenario | Card Number | Exp Date | CVC | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Normal Success** | `4242 4242 4242 4242` | Future date | Any 3 digits | Instant Success (`200 OK`) |
| **3D Secure OTP** | `4000 0027 6000 3184` | Future date | Any 3 digits | Triggers Bank 3DS Modal popup |
| **Card Declined** | `4000 0000 0000 0002` | Future date | Any 3 digits | Returns `card_declined` error |
| **Insufficient Funds** | `4000 0000 0000 0999` | Future date | Any 3 digits | Returns `insufficient_funds` error |
| **Expired Card** | `4000 0000 0000 0101` | Past date | Any 3 digits | Returns `expired_card` error |
| **Incorrect CVC** | `4000 0000 0000 0127` | Future date | Any 3 digits | Returns `incorrect_cvc` error |

---

## 12. Frontend Integration Examples (React / Next.js)

### 12.1 Pattern 1: Stripe Hosted Checkout (Simplest & Best)

```tsx
// components/SubscribeButton.tsx
"use client";

import React, { useState } from "react";

export const SubscribeButton = () => {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/payment/checkout-subscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: JSON.stringify({ planType: "monthly" })
            });

            const data = await response.json();

            if (data.success && data.data.paymentUrl) {
                // Redirect user to Stripe's hosted checkout page
                window.location.href = data.data.paymentUrl;
            } else {
                alert(data.message || "Failed to initiate payment");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
        >
            {loading ? "Redirecting to Stripe..." : "Upgrade to Pro"}
        </button>
    );
};
```

---

### 12.2 Pattern 2: Embedded Custom Checkout (Stripe Elements)

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```tsx
// components/CustomPaymentForm.tsx
"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success`,
            },
        });

        if (error) {
            setErrorMessage(error.message || "Payment failed");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-6 bg-white rounded-xl shadow-lg">
            <PaymentElement />
            <button
                type="submit"
                disabled={loading || !stripe || !elements}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        </form>
    );
}

export function CustomPaymentModal({ amountInCents }: { amountInCents: number }) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/payment/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify({ amountInCents })
        })
            .then(res => res.json())
            .then(data => setClientSecret(data.data.clientSecret));
    }, [amountInCents]);

    if (!clientSecret) return <p>Loading payment options...</p>;

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
        </Elements>
    );
}
```

---

## 13. Top 7 Beginner Traps & Security Checklist

| # | Trap / Pitfall | Why It Breaks | How to Fix It |
| :-: | :--- | :--- | :--- |
| **1** | **Unit of Currency ($10 vs 1000)** | Stripe calculates amounts in **cents**. Passing `10` charges $0.10. | Always multiply dollar amounts by `100`: `$10.00` = `1000`. |
| **2** | **Body Parser Order in `app.ts`** | `express.json()` corrupts the raw signature buffer. | Mount `express.raw({ type: 'application/json' })` **above** `express.json()`. |
| **3** | **Accepting Prices from Frontend** | Hackers can inspect HTTP traffic and change `$100` to `$1`. | **Never** accept `amount` directly from client. Lookup prices in DB or use Stripe Price IDs (`price_xxx`). |
| **4** | **Sync Webhook Processing** | Stripe times out after 10s if your server runs heavy jobs synchronously. | Return `HTTP 200` quickly and process heavy emails or PDF generation via queue workers. |
| **5** | **Canceling with Customer ID** | Passing `cus_xxx` to `stripe.subscriptions.cancel()` throws a Stripe API error. | Always cancel with the **Subscription ID** (`sub_xxx`), not `cus_xxx`. |
| **6** | **Immediate Account Cutoff** | Deleting access when user clicks "Cancel" creates chargeback complaints. | Use `cancel_at_period_end: true`. Let access stay active until `currentPeriodEnd`. |
| **7** | **Missing Metadata** | Hard to map webhook payloads back to specific database records. | Always attach `{ userId, orderId, paymentType }` to session `metadata`. |

---

## 14. Quick Reference Cheat Sheet

```ts
// 1. One-time Checkout URL
const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price_data: { currency: "usd", product_data: { name: "Book" }, unit_amount: 1500 }, quantity: 1 }],
    success_url: `${config.app_url}/success`,
    cancel_url: `${config.app_url}/cancel`,
    metadata: { userId, orderId, paymentType: "ONE_TIME" }
});

// 2. Subscription Checkout URL
const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: config.stripe_product_price_id, quantity: 1 }],
    success_url: `${config.app_url}/premium?success=true`,
    cancel_url: `${config.app_url}/premium?success=false`,
    metadata: { userId, paymentType: "SUBSCRIPTION" }
});

// 3. Cancel Subscription at Period End (Standard SaaS)
await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true });

// 4. Construct Webhook Signature (Requires Raw Buffer)
const event = stripe.webhooks.constructEvent(payloadBuffer, signature, endpointSecret);
```

---

*Authored for production systems using Node.js, Express, TypeScript, and Prisma ORM.*
