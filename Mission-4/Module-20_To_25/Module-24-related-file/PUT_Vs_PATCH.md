# 🔄 PUT vs PATCH — Complete Guide

> **Module 24 Reference** | Prisma Press Backend
>
> From Beginner to Advanced — Step by Step

---

## 📌 What Are PUT and PATCH?

Both `PUT` and `PATCH` are **HTTP methods** used to **update existing data** on a server.

Think of it like editing a form:
- **PUT** = Replace the **entire form** with new values
- **PATCH** = Change only **specific fields** in the form

---

## 🟦 PART 1 — The Actual Difference

---

### Step 1 — Basic Definition

| Method | Meaning |
|--------|---------|
| `PUT`  | **Full replacement** — send the complete object, replace everything |
| `PATCH`| **Partial update** — send only the fields you want to change |

---

### Step 2 — Simple Real-World Analogy

Imagine you have a **user profile card**:

```
Name:  John Doe
Email: john@gmail.com
Bio:   "I love coding"
Role:  USER
```

**Scenario:** You only want to change the `Bio`.

**Using PUT ❌ (wrong approach for partial update):**
You must send the ENTIRE card again:
```json
{
  "name":  "John Doe",
  "email": "john@gmail.com",
  "bio":   "I love coding and traveling",
  "role":  "USER"
}
```
If you forget to include `email`, it gets wiped out or causes an error.

**Using PATCH ✅ (correct approach for partial update):**
Send only the field you want to change:
```json
{
  "bio": "I love coding and traveling"
}
```
Everything else stays exactly as it was.

---

### Step 3 — Technical Difference

| Property | PUT | PATCH |
|----------|-----|-------|
| **What to send** | The complete resource | Only the changed fields |
| **Missing fields** | May be set to `null` / cause error | Untouched — kept as-is |
| **Idempotent?** | ✅ Yes (same result every time) | ⚠️ Usually yes, but not guaranteed |
| **HTTP Standard** | RFC 7231 | RFC 5789 |
| **Bandwidth** | Sends more data | Sends less data |

> 💡 **Idempotent** means: calling it 10 times gives the same result as calling it once.
> Example: `PUT /users/1` with `{ name: "John" }` → always results in name being "John", no matter how many times you call it.

---

### Step 4 — What Happens With Missing Fields

**Database record:**
```json
{
  "id":    "abc-123",
  "name":  "John",
  "email": "john@example.com",
  "bio":   "Hello"
}
```

#### PUT Request — only sends name:
```http
PUT /api/users/abc-123
{
  "name": "John Updated"
}
```

**Result (bad):**
```json
{
  "id":    "abc-123",
  "name":  "John Updated",
  "email": null,          ← ❌ WIPED because it wasn't sent
  "bio":   null           ← ❌ WIPED because it wasn't sent
}
```

#### PATCH Request — only sends name:
```http
PATCH /api/users/abc-123
{
  "name": "John Updated"
}
```

**Result (good):**
```json
{
  "id":    "abc-123",
  "name":  "John Updated",  ← ✅ updated
  "email": "john@example.com",  ← ✅ unchanged
  "bio":   "Hello"              ← ✅ unchanged
}
```

---

### Step 5 — Route Naming Convention

Both use the same URL pattern but different HTTP methods:

```
GET    /api/users/:id    → Read one user
PUT    /api/users/:id    → Full replace user
PATCH  /api/users/:id    → Partial update user
DELETE /api/users/:id    → Delete user
```

---

### Step 6 — Code Implementation in This Project

#### ✅ PUT — Full Update (Service Layer)

```typescript
// user.service.ts

const updateUserFull = async (userId: string, payload: IFullUpdateUserPayload) => {
    // payload MUST contain all required fields
    const { name, email, bio, role } = payload;

    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            name,     // ← all fields explicitly set
            email,
            role,
        }
    });

    return result;
};
```

```typescript
// user.controller.ts

const updateUserFull = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const payload = req.body; // expects ALL fields

    const result = await userService.updateUserFull(userId, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User fully updated",
        data: result
    });
});
```

```typescript
// user.route.ts
router.put("/:id", auth(Role.ADMIN), updateUserFull);  // PUT
```

---

#### ✅ PATCH — Partial Update (Service Layer)

```typescript
// user.service.ts

const updateUserPartial = async (userId: string, payload: Partial<IUpdateUserPayload>) => {
    // payload can have ANY combination of fields
    const result = await prisma.user.update({
        where: { id: userId },
        data: payload  // Prisma only updates the fields you pass in
    });

    return result;
};
```

```typescript
// user.controller.ts

const updateUserPartial = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const payload = req.body; // can have 1 field or many — all optional

    const result = await userService.updateUserPartial(userId, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User partially updated",
        data: result
    });
});
```

```typescript
// user.route.ts
router.patch("/:id", auth(Role.USER, Role.ADMIN), updateUserPartial);  // PATCH
```

---

### Step 7 — TypeScript Interface Difference

```typescript
// For PUT — all fields required (none optional)
interface IFullUpdateUserPayload {
    name:  string;     // required ✅
    email: string;     // required ✅
    role:  Role;       // required ✅
}

// For PATCH — all fields optional (any combination allowed)
interface IPartialUpdateUserPayload {
    name?:  string;    // optional ✅
    email?: string;    // optional ✅
    role?:  Role;      // optional ✅
}

// TypeScript shortcut — Partial<T> makes all fields optional
type IPartialUpdateUserPayload = Partial<IFullUpdateUserPayload>;
//   ↑ Same as writing all fields with "?" manually
```

---

### Step 8 — Prisma Behavior Difference

**Prisma's `update()` is PATCH-safe by default.**

When you call `prisma.user.update()`, Prisma only modifies the fields you provide in `data`. Fields not in `data` are automatically left unchanged.

```typescript
// This PATCH is safe — only updates name, leaves email/role/etc. untouched
await prisma.user.update({
    where: { id: userId },
    data: { name: "New Name" }  // only "name" field changes
});
```

For a true **PUT** behavior, you must explicitly send all fields:

```typescript
// PUT — explicitly set every field
await prisma.user.update({
    where: { id: userId },
    data: {
        name:         payload.name,
        email:        payload.email,
        role:         payload.role,
        activeStatus: payload.activeStatus,
    }
});
```

---

## 🟩 PART 2 — Which Situation Uses Which?

---

### Situation 1 — User Edits Their Own Profile Bio/Photo

> Only changing 1 or 2 fields → **Use PATCH**

```
PATCH /api/users/me/profile
{ "bio": "New bio text" }
```

Why PATCH? Because you don't want to force the user to re-send all profile fields just to change their bio.

---

### Situation 2 — Admin Fully Updates a User Record

> Replacing the entire record from a form → **Use PUT**

```
PUT /api/admin/users/:id
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "AUTHOR",
  "activeStatus": "ACTIVE"
}
```

Why PUT? Admin filled in a complete form with all fields — it's a full replacement.

---

### Situation 3 — User Changes Their Password

> Only changing one specific field → **Use PATCH**

```
PATCH /api/users/me/password
{ "currentPassword": "old123", "newPassword": "new456" }
```

Why PATCH? You're only updating the `password` field, nothing else.

---

### Situation 4 — Post Status Update (Publish / Archive / Draft)

> Changing a single status field → **Use PATCH**

```
PATCH /api/posts/:id/status
{ "status": "PUBLISHED" }
```

Why PATCH? Only the `status` field changes. Title, content, tags, etc. stay the same.

---

### Situation 5 — Moderating a Comment (Approve/Reject)

> Admin changes only status → **Use PATCH**

```
PATCH /api/comments/:id/moderate
{ "status": "REJECTED" }
```

Why PATCH? Only one field (`status`) is being changed on the comment.

---

### Situation 6 — User Subscription Status Change

> Single field change → **Use PATCH**

```
PATCH /api/subscriptions/:id
{ "status": "CANCELLED" }
```

Why PATCH? Only `status` changes from `ACTIVE` to `CANCELLED`.

---

### Situation 7 — Admin Replaces All Settings in a Config Panel

> All fields are submitted from a settings form → **Use PUT**

```
PUT /api/settings
{
  "siteName":    "Prisma Press",
  "siteEmail":   "admin@prismapress.com",
  "allowSignup": true,
  "maxPostSize": 10000
}
```

Why PUT? The entire settings object is being replaced with a fresh set of values.

---

### Situation 8 — Editing a Full Blog Post (All Fields)

> Author fills in the complete edit form → **Use PUT**

```
PUT /api/posts/:id
{
  "title":      "My Updated Post",
  "content":    "Full content here...",
  "thumbnail":  "https://...",
  "tags":       ["tech", "prisma"],
  "status":     "PUBLISHED",
  "isFeatured": false
}
```

Why PUT? Every field of the post is being re-submitted from the edit form.

---

### Decision Guide (Flowchart in Text)

```
Are you updating ALL fields of the resource?
├── YES → Use PUT
└── NO  → Are you updating just some fields?
          └── YES → Use PATCH
```

Or simply:

```
Sending 1-2 fields?         → PATCH
Sending a complete object?  → PUT
Status/toggle update?       → PATCH
Full form submission?       → PUT
User preference change?     → PATCH
Admin record replacement?   → PUT
```

---

## 📌 Quick Reference Summary

| | PUT | PATCH |
|---|---|---|
| **Fields to send** | All (required) | Only the ones you want to change |
| **Missing field behavior** | May wipe or error | Left unchanged |
| **Use when** | Full form submission / record replacement | Status change, single-field edit, profile update |
| **Request body size** | Larger | Smaller |
| **TypeScript interface** | All fields required | All fields with `?` (optional) |
| **Prisma `update()` behavior** | Must pass all fields manually | Pass only changed fields — Prisma handles the rest |
| **Route example** | `router.put("/:id", handler)` | `router.patch("/:id", handler)` |
| **Real examples in project** | Full post edit, full user update | Status update, password change, moderation |

---

## 📌 Common Beginner Mistakes

### ❌ Mistake 1 — Using PUT for partial updates

```typescript
// ❌ Wrong — if user only sends { name: "John" } with PUT,
// all other fields might get wiped
router.put("/:id", updateUser);
```

```typescript
// ✅ Correct — use PATCH for partial updates
router.patch("/:id", updateUser);
```

---

### ❌ Mistake 2 — Making all PATCH fields required

```typescript
// ❌ Wrong — PATCH payload should NOT require all fields
interface IUpdateUserPayload {
    name:  string;   // ← required — bad for PATCH
    email: string;   // ← required — bad for PATCH
}
```

```typescript
// ✅ Correct — all fields optional for PATCH
interface IUpdateUserPayload {
    name?:  string;  // optional
    email?: string;  // optional
}
// Or use TypeScript's built-in Partial<>:
type IUpdateUserPayload = Partial<{ name: string; email: string }>;
```

---

### ❌ Mistake 3 — Forgetting to validate that at least ONE field is sent in PATCH

```typescript
// ❌ Bad — allows empty PATCH body {}
const updateUserPartial = async (userId: string, payload: object) => {
    return await prisma.user.update({ where: { id: userId }, data: payload });
};

// ✅ Good — check that something was actually sent
const updateUserPartial = async (userId: string, payload: Record<string, unknown>) => {
    if (Object.keys(payload).length === 0) {
        throw new Error("No fields provided to update");
    }
    return await prisma.user.update({ where: { id: userId }, data: payload });
};
```

---

## 📌 Final Rule of Thumb

> - **PATCH** = "I want to change **just this one thing**"
> - **PUT** = "Here is the **complete new version** of this resource"

When in doubt, ask yourself:
> *"If the user only sends part of the data, should the rest be deleted?"*
> - Yes → PUT
> - No  → PATCH

---

## 🟨 PART 3 — Does `prisma.update()` Care About PUT or PATCH?

> **Short Answer:** `prisma.update()` itself **doesn't care** — it always behaves partially at the database level. But the difference between PUT and PATCH **still matters** in 4 other layers.

---

### Step 1 — What `prisma.update()` Actually Does

`prisma.update()` only modifies the fields you pass inside `data: {}`.
Fields you **don't** include are **automatically left unchanged** in the database — always.

```typescript
// You call this:
await prisma.user.update({
    where: { id: "abc-123" },
    data: { name: "New Name" }   // only name passed
});

// Database BEFORE: { id: "abc-123", name: "John",     email: "john@gmail.com", role: "USER" }
// Database AFTER:  { id: "abc-123", name: "New Name", email: "john@gmail.com", role: "USER" }
//                                    ↑ changed          ↑ untouched             ↑ untouched
```

This is **always true** — whether your route is PUT or PATCH.

---

### Step 2 — Where the Difference Actually Lives

The PUT vs PATCH difference lives at **4 layers above `prisma.update()`**:

```
Client sends request
        ↓
① HTTP Method   (PUT or PATCH)          ← difference starts here
        ↓
② Controller    (validates req.body)    ← difference enforced here
        ↓
③ TypeScript    (interface definition)  ← difference typed here
        ↓
④ Service       (receives payload)      ← difference passed here
        ↓
⑤ prisma.update()                       ← DOES NOT CARE — works the same
        ↓
Database
```

---

### Step 3 — Layer by Layer with Real Code

#### ① HTTP Method — The Signal to the Client

```
PUT   /api/users/:id  →  tells client: "you must send ALL fields"
PATCH /api/users/:id  →  tells client: "send only what changed"
```

This is your **API contract** — a promise to whoever calls your API.

---

#### ② Controller Layer — Validation Differs

```typescript
// ─── PUT Controller ─────────────────────────────────────────────
// Expects ALL fields — rejects if any are missing
const updateUserFull = catchAsync(async (req: Request, res: Response) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        throw new Error("PUT requires all fields: name, email, role");
    }

    const result = await userService.updateUserFull(req.params.id, { name, email, role });
    sendResponse(res, { statusCode: 200, success: true, message: "User updated", data: result });
});

// ─── PATCH Controller ────────────────────────────────────────────
// Accepts ANY subset of fields — no "missing field" error
const updateUserPartial = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;  // { name } alone? fine. { email } alone? fine.

    if (Object.keys(payload).length === 0) {
        throw new Error("No fields provided to update");
    }

    const result = await userService.updateUserPartial(req.params.id, payload);
    sendResponse(res, { statusCode: 200, success: true, message: "User updated", data: result });
});
```

---

#### ③ TypeScript Interface — How Types Differ

```typescript
// ─── PUT interface — all fields REQUIRED ──────────────────────────
interface IFullUpdateUserPayload {
    name:  string;   // required — TypeScript error if missing
    email: string;   // required
    role:  Role;     // required
}

// ─── PATCH interface — all fields OPTIONAL ─────────────────────────
interface IPartialUpdateUserPayload {
    name?:  string;   // optional — no error if missing
    email?: string;
    role?:  Role;
}

// Shortcut: Partial<T> makes all fields optional automatically
type IPartialUpdateUserPayload = Partial<IFullUpdateUserPayload>;
```

---

#### ④ Service Layer — Both Call the Same `prisma.update()`

```typescript
// ─── PUT Service ────────────────────────────────────────────────
const updateUserFull = async (userId: string, payload: IFullUpdateUserPayload) => {
    const { name, email, role } = payload;

    return await prisma.user.update({
        where: { id: userId },
        data: { name, email, role }   // all 3 fields explicitly set
    });
};

// ─── PATCH Service ───────────────────────────────────────────────
const updateUserPartial = async (userId: string, payload: IPartialUpdateUserPayload) => {

    return await prisma.user.update({
        where: { id: userId },
        data: payload   // could be 1 field or 3 — Prisma handles it
    });
};
// ✅ Both call prisma.update(). The DB behavior is 100% identical.
// The PUT vs PATCH difference was already handled by layers ①②③ above.
```

---

### Step 4 — Real-Life Scenario: User Changes Their Name Only

**The user only wants to update their name. Email and role stay the same.**

#### ❌ Using PUT — only sends name — breaks validation

```http
PUT /api/users/abc-123
{ "name": "Alice Updated" }
```

```typescript
// Controller receives:
const { name, email, role } = req.body;
// name  = "Alice Updated"
// email = undefined   ← MISSING
// role  = undefined   ← MISSING

if (!name || !email || !role) {
    throw new Error("PUT requires all fields"); // ← 400 Bad Request
}
```

**Result:** ❌ Request fails — client must send email and role too, even though they didn't change.

---

#### ✅ Using PATCH — sends only what changed — works perfectly

```http
PATCH /api/users/abc-123
{ "name": "Alice Updated" }
```

```typescript
// Controller receives:
const payload = req.body;
// payload = { name: "Alice Updated" }   ← 1 field, totally fine

await prisma.user.update({
    where: { id: "abc-123" },
    data: { name: "Alice Updated" }  // only name updates
});

// Database result:
// { name: "Alice Updated", email: "alice@gmail.com", role: "USER" }
//  ↑ changed               ↑ untouched               ↑ untouched
```

**Result:** ✅ Works perfectly.

---

### Step 5 — Summary Table

| Layer | PUT | PATCH | `prisma.update()` cares? |
|---|---|---|---|
| HTTP Method | `PUT` | `PATCH` | ❌ No |
| Controller validation | All fields required | Any subset OK | ❌ No |
| TypeScript interface | All required (`string`) | All optional (`string?`) | ❌ No |
| Service function | All fields passed explicitly | Payload passed as-is | ❌ No |
| `prisma.update()` call | Same call | Same call | ✅ **Both identical** |
| Database result | Only changed fields saved | Only changed fields saved | ✅ **Both identical** |

---

### Step 6 — Final Takeaway

> `prisma.update()` is **naturally PATCH-like** at the database level.
>
> The PUT vs PATCH distinction is **your responsibility** as a developer:
>
> | You enforce it through | How |
> |---|---|
> | **TypeScript interfaces** | `required` vs `Partial<>` (optional) |
> | **Controller validation** | All fields required vs at least one |
> | **HTTP method on router** | `router.put()` vs `router.patch()` |
> | **API contract to client** | Signal what they must send |
>
> Think of `prisma.update()` as a tool. **You** decide how to use it — PUT style (enforce all fields) or PATCH style (accept any subset).
