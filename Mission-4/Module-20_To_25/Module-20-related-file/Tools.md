# 🛠️ Project Development Tools Guide

A curated list of tools used throughout the full-stack project development lifecycle — from brainstorming and database design to implementation, API testing, and deployment.

---

## 1. 🎨 Whiteboard Tool — Excalidraw

> **Best for:** Brainstorming, User Flow Diagrams, System Architecture sketches, Wireframing

```
https://excalidraw.com/#room=f3443ed51e4571731648,wvdZAVWRNDwG1_22i1vtZA
```

### ✅ Features
| Feature | Description |
|---|---|
| 🖊️ Free-hand Drawing | Sketch freely with pen, shapes, arrows, and text |
| 👥 Real-Time Collaboration | Multiple users edit the same canvas simultaneously |
| ♾️ Infinite Canvas | No boundaries — plan as large as needed |
| 📤 Export Options | Export to PNG, SVG, clipboard, or shareable link |
| 🔒 End-to-End Encrypted | Shared rooms are private and encrypted |
| 🌙 Dark / Light Mode | Switch between themes based on preference |
| 📦 Library Support | Reuse pre-built component shapes & icons |

### 🚀 How to Use
1. Click the shared link above to open the collaborative room directly.
2. Use the **toolbar** (top) to select pencil, shapes, arrows, and text tools.
3. **Drag and drop** elements, hold `Shift` to select multiple.
4. Use `Ctrl + Z` to undo and `Ctrl + Y` to redo.
5. **Share** the URL with your team for real-time editing.
6. Go to `Menu → Export` to save your diagram as PNG or SVG.

### 💡 Pro Tips
- Use **arrow labels** to annotate flow directions.
- Group elements with `Ctrl + G` for easy movement.
- Use **frames** to organize different diagram sections (e.g., Auth Flow vs. Order Flow).
- Press `?` to view all keyboard shortcuts.

### 🎯 When to Use in This Project
- **Step 2 (Brainstorming):** Sketch out high-level system ideas.
- **Step 3 (Architecture):** Draw role hierarchy and module layout.
- **Step 4 (Flow Mapping):** Create User Journey and Auth flow diagrams.

---

## 2. 🗄️ Database Design Tool — DrawSQL

> **Best for:** Entity Relationship Diagrams (ERD), Schema Visualization, Table Design

```
https://drawsql.app/
```

### ✅ Features
| Feature | Description |
|---|---|
| 🏗️ Visual Table Builder | Add columns, data types, and constraints visually |
| 🔗 Relationship Links | Draw FK relationships with visual connecting arrows |
| 🗃️ Multi-DB Support | Supports PostgreSQL, MySQL, SQLite, MSSQL |
| 👥 Team Collaboration | Invite teammates to view or edit schemas |
| 📤 Export | Export to PNG, PDF, or SQL migration scripts |
| 🔄 Version History | Track changes across schema revisions |
| 🌐 Public Sharing | Share diagrams publicly via a link |

### 🚀 How to Use
1. Sign up / log in at [https://drawsql.app/](https://drawsql.app/).
2. Click **"+ New Diagram"** and choose your database engine (e.g., PostgreSQL).
3. Click **"+ Add Table"** and define columns with types (`VARCHAR`, `INT`, `BOOLEAN`, etc.).
4. Set **Primary Keys**, **Not Null**, **Unique**, and **Default** constraints per column.
5. Link tables using **Foreign Keys** — drag from the FK column to the referenced table.
6. Use **Export → PNG** to embed the ERD in your README or documentation.

### 💡 Pro Tips
- Name your tables in `snake_case` to match Prisma conventions (e.g., `order_items`).
- Use **soft delete** columns: add `deleted_at TIMESTAMP NULL` instead of hard deleting rows.
- Always add `created_at` and `updated_at` timestamp columns to every table.
- Visualize **junction tables** for Many-to-Many relationships clearly (e.g., `order_products`).

### 🎯 When to Use in This Project
- **Step 5 (ERD Design):** Build the complete database schema visually.
- **Step 7 (Prisma Schema):** Use ERD as reference when writing `schema.prisma` models.

---

## 3. 📮 API Platform & Testing Tool — Postman

> **Best for:** REST & GraphQL API Testing, Automated Testing, Mock Servers, API Documentation, Team Collaboration

```
https://www.postman.com/
https://www.postman.com/downloads/
```
> *VS Code In-Editor Alternative:* **Thunder Client** (`ext install rangav.vscode-thunder-client`)

### ✅ Features
| Feature | Description |
|---|---|
| 📁 Collections & Folders | Group endpoints logically by feature module (Auth, Users, Products, Orders) |
| 🌐 Environments & Variables | Seamlessly switch between `Local`, `Staging`, and `Production` environments |
| 🧪 Automated Testing | Write test scripts using JavaScript & Chai assertions (`pm.test()`) |
| ⚡ Pre-Request Scripts | Run scripts before requests to generate hashes, dynamic timestamps, or params |
| 🔑 Dynamic Auth Handling | Auto-extract JWT tokens from login response and inject into protected routes |
| 🏃 Collection Runner | Run entire test suites sequentially and generate pass/fail test reports |
| 📑 API Documentation | Automatically generate and publish interactive web API documentation |
| 🤖 CI/CD Integration | Run collections from the terminal and CI pipelines using **Newman CLI** |
| 👥 Team Workspaces | Share collections, environments, and sync changes with team in real time |

### 🚀 How to Use
1. **Download & Install:** Download Postman Desktop from [postman.com/downloads](https://www.postman.com/downloads/) or open the web app.
2. **Create a Workspace & Collection:**
   - Create a workspace (e.g., `My Fullstack Project`).
   - Create a new collection (e.g., `Backend API v1`) and add folders for each module (`Auth`, `Users`, `Orders`).
3. **Configure Environment Variables:**
   - Create a new environment called `Development`.
   - Add variables:
     - `BASE_URL`: `http://localhost:5000/api/v1`
     - `ACCESS_TOKEN`: *(leave initial value empty)*
4. **Create API Requests:**
   - Set HTTP Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
   - Set URL: `{{BASE_URL}}/auth/login`.
   - In the **Body** tab, choose `raw` $\rightarrow$ `JSON` and enter the payload.
5. **Automate JWT Token Capture (Tests Tab):**
   - In the `POST /auth/login` request, go to the **Tests** tab and add:
     ```javascript
     pm.test("Status code is 200", function () {
         pm.response.to.have.status(200);
     });

     const response = pm.response.json();
     if (response.data && response.data.accessToken) {
         pm.environment.set("ACCESS_TOKEN", response.data.accessToken);
         console.log("Access token saved to environment variable!");
     }
     ```
6. **Use Token for Protected Routes:**
   - In collection settings or individual requests, set **Authorization** type to `Bearer Token`.
   - Token value: `{{ACCESS_TOKEN}}`.
7. **Run Automated Test Suite:**
   - Click the collection name $\rightarrow$ click **Run Collection**.
   - Review the summary of passed and failed test assertions.

### 💡 Pro Tips
- **Inherit Auth from Parent:** Set Authorization at the Collection or Folder level to `Bearer Token: {{ACCESS_TOKEN}}`. All child requests set to *"Inherit auth from parent"* will automatically use it without manual configuration.
- **Export & Version Control:** Export your collection (`.json`) and environment (`.json`) files and commit them inside a `postman/` directory in your Git repository.
- **Run in Terminal via Newman:** Install Newman globally (`npm install -g newman`) and run your tests headlessly:
  ```bash
  newman run postman_collection.json -e postman_environment.json
  ```
- **Consistent Response Schema Testing:** Add tests to verify response format:
  ```javascript
  pm.test("Response contains required fields", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData).to.have.property("success");
      pm.expect(jsonData).to.have.property("data");
  });
  ```

### 🎯 When to Use in This Project
- **Step 3 (Architecture Planning):** Draft API contracts and endpoints before coding.
- **Step 9 (Business Logic & API):** Test each controller, service, and validation rule as you build them.
- **Step 10 (Verification & QA):** Run end-to-end regression tests on all routes before deployment.

---

## 4. 🧰 Code Quality & Developer Tools

| Tool | Purpose | Link |
|---|---|---|
| **VS Code** | Primary code editor | https://code.visualstudio.com/ |
| **Prisma Studio** | Visual DB browser (`npx prisma studio`) | Built-in Prisma CLI |
| **ESLint** | JavaScript/TypeScript linting | https://eslint.org/ |
| **Prettier** | Code formatter | https://prettier.io/ |
| **Git & GitHub** | Version control & collaboration | https://github.com/ |
| **dotenv** | Manage environment variables (`.env`) | https://npmjs.com/package/dotenv |

---

## 5. 📐 Recommended VS Code Extensions

```bash
# Install via VS Code Marketplace or Extensions panel (Ctrl + Shift + X)
```

| Extension | Purpose |
|---|---|
| **Prisma** | Syntax highlighting & formatting for `.prisma` files |
| **ESLint** | Inline linting feedback |
| **Prettier** | Auto-format on save |
| **Thunder Client** | In-editor API testing (Postman alternative) |
| **GitLens** | Enhanced Git history and blame annotations |
| **Error Lens** | Display errors and warnings inline in editor |
| **Auto Rename Tag** | Sync rename opening/closing HTML/JSX tags |
| **Path Intellisense** | Auto-complete file paths in imports |

---

## 📋 Tools by Project Stage

| Project Stage | Recommended Tool |
|---|---|
| Brainstorming | Excalidraw |
| User Flow Design | Excalidraw / Miro |
| ERD & DB Design | DrawSQL / dbdiagram.io |
| Project Setup | VS Code, Git |
| Schema Definition | Prisma + VS Code Prisma Extension |
| Database Inspection | Prisma Studio |
| API Development | VS Code + TypeScript |
| API Testing | Postman / Thunder Client |
| Code Quality | ESLint + Prettier |
| Version Control | Git + GitHub |

---

*Keep this document updated as new tools are added to the project workflow.*
