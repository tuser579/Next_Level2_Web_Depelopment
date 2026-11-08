# 📘 JavaScript Core Concepts for Next.js

> A curated reference of essential JavaScript concepts you must know before or while learning Next.js. Each concept includes a short explanation, example code, and key points.

---

## Table of Contents

1. [ES6+ Modules (import / export)](#1-es6-modules-import--export)
2. [Arrow Functions](#2-arrow-functions)
3. [Destructuring](#3-destructuring)
4. [Spread & Rest Operator](#4-spread--rest-operator)
5. [Template Literals](#5-template-literals)
6. [Array Methods (map, filter, reduce, find)](#6-array-methods-map-filter-reduce-find)
7. [Promises & Async/Await](#7-promises--asyncawait)
8. [Fetch API](#8-fetch-api)
9. [Optional Chaining & Nullish Coalescing](#9-optional-chaining--nullish-coalescing)
10. [Short-Circuit Evaluation](#10-short-circuit-evaluation)
11. [Ternary Operator](#11-ternary-operator)
12. [Object Methods (Object.keys, values, entries)](#12-object-methods)
13. [Default Parameters](#13-default-parameters)
14. [Closures](#14-closures)
15. [Higher-Order Functions](#15-higher-order-functions)
16. [JSON (parse & stringify)](#16-json-parse--stringify)
17. [Error Handling (try/catch/finally)](#17-error-handling-trycatchfinally)
18. [LocalStorage & SessionStorage](#18-localstorage--sessionstorage)
19. [Callback Functions](#19-callback-functions)
20. [Prototype & Class (OOP Basics)](#20-prototype--class-oop-basics)

---

## 1. ES6+ Modules (import / export)

### 📌 Explanation
Next.js is built on ES Modules. Every component, utility, or data file uses `import` and `export` to share code between files.

### ✅ Example

```js
// utils/greet.js  ← Named Export
export const greet = (name) => `Hello, ${name}!`;
export const PI = 3.14159;

// utils/math.js  ← Default Export
const add = (a, b) => a + b;
export default add;

// app/page.js  ← Importing
import add from './utils/math';            // default import
import { greet, PI } from './utils/greet'; // named import

console.log(greet("Next.js")); // Hello, Next.js!
console.log(add(2, 3));        // 5
```

### 🔑 Key Points
- **Default export** → one per file, import with any name
- **Named export** → multiple per file, import with `{ }` using the exact name
- In Next.js, every `page.js` must have a **default export** (the component)
- Use `index.js` barrel files to group exports cleanly

---

## 2. Arrow Functions

### 📌 Explanation
Arrow functions are the standard way to write functions in modern JS and React/Next.js components, callbacks, and event handlers.

### ✅ Example

```js
// Traditional function
function square(n) {
  return n * n;
}

// Arrow function — single line (implicit return)
const square = (n) => n * n;

// Arrow function — multi-line
const greetUser = (name) => {
  const message = `Welcome, ${name}`;
  return message;
};

// In Next.js component
const Navbar = () => {
  return <nav>My App</nav>;
};

export default Navbar;
```

### 🔑 Key Points
- Arrow functions do **not** have their own `this` (important for class components)
- Single-expression functions can **omit `return`** and `{}`
- Parentheses around a single param are optional: `n => n * n`
- Used heavily in `.map()`, `.filter()`, and event handlers in Next.js

---

## 3. Destructuring

### 📌 Explanation
Destructuring lets you extract values from arrays or properties from objects into individual variables — extremely common in Next.js props, hooks, and API responses.

### ✅ Example

```js
// ── Object Destructuring ──
const user = { name: "Tushar", age: 22, role: "developer" };

const { name, age, role } = user;
console.log(name); // Tushar

// Rename while destructuring
const { name: fullName } = user;
console.log(fullName); // Tushar

// Default value
const { country = "Bangladesh" } = user;
console.log(country); // Bangladesh

// ── Array Destructuring ──
const colors = ["red", "green", "blue"];
const [primary, secondary] = colors;
console.log(primary);   // red
console.log(secondary); // green

// ── In Next.js (Props Destructuring) ──
const UserCard = ({ name, age }) => {
  return <p>{name} is {age} years old</p>;
};

// ── useState Hook Destructuring ──
const [count, setCount] = useState(0);
```

### 🔑 Key Points
- Object destructuring uses `{}`, array destructuring uses `[]`
- You can set **default values** directly in destructuring
- Rename variables using `: newName` syntax
- Always destructure **props** in Next.js functional components

---

## 4. Spread & Rest Operator

### 📌 Explanation
Both use `...` syntax. **Spread** expands an iterable; **Rest** collects multiple elements into one. Used in state updates, merging data, and function parameters.

### ✅ Example

```js
// ── Spread Operator ──

// Merge objects (like updating state)
const defaultSettings = { theme: "dark", lang: "en" };
const userSettings    = { lang: "bn", fontSize: 16 };
const finalSettings   = { ...defaultSettings, ...userSettings };
// { theme: "dark", lang: "bn", fontSize: 16 }

// Clone array
const nums    = [1, 2, 3];
const newNums = [...nums, 4, 5]; // [1, 2, 3, 4, 5]

// ── Rest Operator ──

// Collect remaining arguments
const sum = (first, ...others) => first + others.reduce((acc, n) => acc + n, 0);
console.log(sum(1, 2, 3, 4)); // 10

// Omit a property from object
const { password, ...safeUser } = { name: "Tushar", age: 22, password: "123" };
console.log(safeUser); // { name: "Tushar", age: 22 }

// ── In Next.js (passing all props down) ──
const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);
```

### 🔑 Key Points
- **Spread** = unpacking → `...array` / `...object`
- **Rest** = packing → collects the remaining into an array
- Spread creates a **shallow copy** (not a deep clone)
- Common pattern in Next.js: `{...props}` to pass all props to a child

---

## 5. Template Literals

### 📌 Explanation
Template literals (backticks) allow multi-line strings and embedding expressions directly inside strings — very useful for dynamic class names, URLs, and JSX content.

### ✅ Example

```js
const name    = "Next.js";
const version = 14;

// Old way (concatenation)
const msg1 = "Learning " + name + " version " + version;

// Template Literal
const msg2 = `Learning ${name} version ${version}`;
console.log(msg2); // Learning Next.js version 14

// Multi-line
const html = `
  <div>
    <h1>Hello ${name}</h1>
  </div>
`;

// Expression inside ${}
const price = 100;
const tax   = 0.1;
console.log(`Total: $${(price + price * tax).toFixed(2)}`); // Total: $110.00

// Dynamic API URL in Next.js
const userId = 5;
const apiUrl = `https://jsonplaceholder.typicode.com/users/${userId}`;
```

### 🔑 Key Points
- Use backticks `` ` `` instead of quotes
- Embed any JS expression inside `${ }`
- Supports **multi-line** strings natively
- Ideal for building **dynamic URLs** in `fetch()` calls in Next.js

---

## 6. Array Methods (map, filter, reduce, find)

### 📌 Explanation
These are the most-used array methods in Next.js for rendering lists, filtering data, transforming API responses, and aggregating values.

### ✅ Example

```js
const products = [
  { id: 1, name: "Laptop", price: 1200, inStock: true },
  { id: 2, name: "Phone",  price: 800,  inStock: false },
  { id: 3, name: "Tablet", price: 500,  inStock: true },
];

// ── .map() — Transform each element ──
const names = products.map((p) => p.name);
// ["Laptop", "Phone", "Tablet"]

// ── .filter() — Keep matching elements ──
const available = products.filter((p) => p.inStock);
// [{ Laptop... }, { Tablet... }]

// ── .find() — Get first matching element ──
const found = products.find((p) => p.id === 2);
// { id: 2, name: "Phone", ... }

// ── .reduce() — Accumulate a single value ──
const total = products.reduce((sum, p) => sum + p.price, 0);
// 2500

// ── In Next.js JSX ──
const ProductList = ({ products }) => (
  <ul>
    {products.map((product) => (
      <li key={product.id}>{product.name} — ${product.price}</li>
    ))}
  </ul>
);
```

### 🔑 Key Points
- `.map()` → **transforms** (returns new array, same length)
- `.filter()` → **filters** (returns new array, shorter or equal length)
- `.find()` → returns **first match** or `undefined`
- `.reduce()` → **accumulates** to a single value (sum, object, etc.)
- Always use the `key` prop when using `.map()` in Next.js JSX

---

## 7. Promises & Async/Await

### 📌 Explanation
Next.js heavily uses async operations (data fetching, DB calls, API routes). Understanding Promises and async/await is **mandatory**.

### ✅ Example

```js
// ── Promise ──
const fetchData = new Promise((resolve, reject) => {
  const success = true;
  if (success) resolve("Data loaded!");
  else reject("Error loading data.");
});

fetchData
  .then((data) => console.log(data))   // Data loaded!
  .catch((err) => console.error(err));

// ── Async / Await (cleaner syntax) ──
const getData = async () => {
  try {
    const res  = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const data = await res.json();
    console.log(data.title);
  } catch (error) {
    console.error("Failed:", error);
  }
};
getData();

// ── In Next.js Server Component (App Router) ──
// app/page.js
const Page = async () => {
  const res   = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();

  return (
    <ul>
      {posts.slice(0, 5).map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
};
export default Page;
```

### 🔑 Key Points
- `async` function always returns a **Promise**
- `await` pauses execution until the Promise resolves
- Always wrap `await` in `try/catch` for error handling
- Next.js **Server Components** are `async` by default — fetch directly!
- Never use `await` outside an `async` function

---

## 8. Fetch API

### 📌 Explanation
`fetch()` is the native browser/Node.js API for making HTTP requests. It is the **primary** way to get data in Next.js (both client and server side).

### ✅ Example

```js
// ── GET Request ──
const getUsers = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const users = await response.json();
  return users;
};

// ── POST Request ──
const createPost = async (postData) => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  return await response.json();
};

// ── Next.js Extended Fetch with Cache Control ──
// Server Component
const Page = async () => {
  // Revalidate every 60 seconds (ISR)
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 },
  });

  // No cache (always fresh — SSR behavior)
  const freshRes = await fetch("https://api.example.com/live", {
    cache: "no-store",
  });

  const data = await res.json();
  return <div>{data.title}</div>;
};
```

### 🔑 Key Points
- `fetch()` returns a **Promise** that resolves to a `Response` object
- Call `.json()` on the response to parse the body
- Always check `response.ok` before consuming data
- Next.js **extends** native `fetch` with `{ next: { revalidate } }` and `{ cache }` options
- Use `cache: "no-store"` for SSR, `next: { revalidate: N }` for ISR

---

## 9. Optional Chaining & Nullish Coalescing

### 📌 Explanation
These operators safely handle `null` or `undefined` values without crashing — essential when working with API data that might be missing.

### ✅ Example

```js
const user = {
  name: "Tushar",
  address: { city: "Dhaka" },
  getRole: () => "admin",
};

// ── Optional Chaining (?.) ──
console.log(user.address?.city);   // "Dhaka"
console.log(user.address?.zip);    // undefined (no error)
console.log(user.profile?.bio);    // undefined (no error)
console.log(user.getRole?.());     // "admin"
console.log(user.getScore?.());    // undefined (no error)

// Without optional chaining → TypeError!
// console.log(user.profile.bio);  // ❌ Error

// ── Nullish Coalescing (??) ──
const username = null      ?? "Guest"; // "Guest"
const age      = 0         ?? 18;      // 0  ← 0 is NOT null/undefined
const score    = undefined ?? 100;     // 100

// VS logical OR (||) — treats falsy values as fallback
const age2 = 0 || 18; // 18 ← WRONG! treats 0 as falsy

// ── In Next.js ──
const UserProfile = ({ user }) => (
  <div>
    <p>{user?.name ?? "Anonymous"}</p>
    <p>{user?.address?.city ?? "City not set"}</p>
  </div>
);
```

### 🔑 Key Points
- `?.` — safely access deeply nested properties without `TypeError`
- `??` — returns right-hand side **only** when left is `null` or `undefined`
- `||` returns fallback for **any falsy** value (`0`, `""`, `false`) — prefer `??`
- Combine them: `user?.profile?.bio ?? "No bio"`

---

## 10. Short-Circuit Evaluation

### 📌 Explanation
Used extensively in JSX for **conditional rendering** — render something only if a condition is true.

### ✅ Example

```js
// ── && (AND) Short-circuit ──
const isLoggedIn = true;
isLoggedIn && console.log("Welcome back!"); // Welcome back!

const count = 0;
count && console.log("Has items"); // 0 (does NOT log — watch out!)

// ── || (OR) Short-circuit ──
const name = ""       || "Anonymous"; // "Anonymous"
const role = "admin"  || "user";      // "admin"

// ── In Next.js JSX ──
const Dashboard = ({ isLoggedIn, notifications }) => (
  <div>
    {isLoggedIn && <p>Welcome, User!</p>}
    {notifications?.length > 0 && (
      <span>🔔 {notifications.length} new</span>
    )}
    {!isLoggedIn && <a href="/login">Login</a>}
  </div>
);
```

### 🔑 Key Points
- `A && B` → returns `B` if `A` is truthy, else returns `A`
- `A || B` → returns `A` if truthy, else returns `B`
- In JSX, `0 && <Component />` renders `0` — use `count > 0 && <Component />` instead
- Best used for simple show/hide logic without `if` statements

---

## 11. Ternary Operator

### 📌 Explanation
The compact `condition ? valueIfTrue : valueIfFalse` expression — the **go-to** for inline conditional rendering in JSX.

### ✅ Example

```js
// ── Basic Ternary ──
const age    = 20;
const status = age >= 18 ? "Adult" : "Minor";
console.log(status); // "Adult"

// ── Nested Ternary (use sparingly) ──
const score = 75;
const grade = score >= 90 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "F";
console.log(grade); // "B"

// ── In Next.js JSX ──
const Button = ({ isLoading }) => (
  <button disabled={isLoading}>
    {isLoading ? "Loading..." : "Submit"}
  </button>
);

const ThemeToggle = ({ theme }) => (
  <div className={theme === "dark" ? "bg-dark" : "bg-light"}>
    {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
  </div>
);
```

### 🔑 Key Points
- Syntax: `condition ? trueValue : falseValue`
- Returns a **value** (unlike `if` statements), so it works inside JSX `{}`
- Avoid deeply nested ternaries — extract into a variable or component for clarity
- Great for toggling classes, labels, or rendering alternate UI states

---

## 12. Object Methods

### 📌 Explanation
`Object.keys()`, `Object.values()`, and `Object.entries()` help iterate over objects — useful when rendering data from API responses shaped as objects.

### ✅ Example

```js
const userScores = { alice: 95, bob: 82, carol: 78 };

// ── Object.keys() → array of keys ──
Object.keys(userScores);   // ["alice", "bob", "carol"]

// ── Object.values() → array of values ──
Object.values(userScores); // [95, 82, 78]

// ── Object.entries() → array of [key, value] pairs ──
Object.entries(userScores);
// [["alice", 95], ["bob", 82], ["carol", 78]]

// ── Iterating with entries ──
Object.entries(userScores).forEach(([name, score]) => {
  console.log(`${name}: ${score}`);
});

// ── In Next.js JSX ──
const ScoreBoard = ({ scores }) => (
  <ul>
    {Object.entries(scores).map(([name, score]) => (
      <li key={name}>{name} → {score}</li>
    ))}
  </ul>
);

// ── Merging objects ──
const merged = { ...userScores, dave: 90 }; // Preferred over Object.assign
```

### 🔑 Key Points
- `Object.keys()` → iterate over **keys**
- `Object.values()` → iterate over **values**
- `Object.entries()` → iterate over **[key, value]** pairs (most powerful)
- Combine with `.map()` to render dynamic lists from object data in JSX

---

## 13. Default Parameters

### 📌 Explanation
Default parameter values prevent `undefined` errors and make functions more robust — used in Next.js utility functions, API handlers, and component functions.

### ✅ Example

```js
// Without default — risky
const greet = (name) => `Hello, ${name}`; // greet() → "Hello, undefined"

// With default parameter
const greet = (name = "Guest") => `Hello, ${name}`;
console.log(greet());           // "Hello, Guest"
console.log(greet("Tushar"));  // "Hello, Tushar"

// Multiple defaults
const createUser = (name = "Anonymous", role = "viewer", active = true) => ({
  name,
  role,
  active,
  createdAt: new Date().toISOString(),
});
console.log(createUser("Alice", "admin"));
// { name: "Alice", role: "admin", active: true, createdAt: "..." }

// ── In Next.js API Route ──
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page  = searchParams.get("page")  ?? 1;
  const limit = searchParams.get("limit") ?? 10;
  // fetch posts with pagination defaults
}
```

### 🔑 Key Points
- Default values only kick in when the argument is `undefined` (not `null`)
- Works with destructuring: `const { name = "Guest" } = props`
- Keeps components and functions **predictable** and **safe**
- Common pattern: default values in component props destructuring

---

## 14. Closures

### 📌 Explanation
A closure is when an inner function retains access to the variables of its outer function — the foundation of hooks like `useState` and `useEffect`.

### ✅ Example

```js
// ── Basic Closure ──
const makeCounter = () => {
  let count = 0; // enclosed variable

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount:  () => count,
  };
};

const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
console.log(counter.getCount()); // 1

// ── Closure with parameter (Currying) ──
const multiplier = (factor) => (number) => number * factor;
const double = multiplier(2);
const triple = multiplier(3);
console.log(double(5)); // 10
console.log(triple(5)); // 15

// ── In Next.js / React ──
"use client";
const SearchBar = () => {
  const [query, setQuery] = useState("");

  // This function "closes over" the query variable
  const handleSearch = () => {
    console.log("Searching for:", query); // always has the latest query
  };

  return <input onChange={(e) => setQuery(e.target.value)} />;
};
```

### 🔑 Key Points
- Inner functions remember the **scope in which they were created**
- React **hooks** (`useState`, `useCallback`, `useMemo`) are closure-based
- **Stale closure bug**: list all `useEffect` dependencies to prevent capturing outdated values
- Closures enable **factory functions** and **currying**

---

## 15. Higher-Order Functions

### 📌 Explanation
A Higher-Order Function (HOF) takes a function as an argument or returns a function. They power `.map()`, `.filter()`, `.reduce()`, event handlers, and Next.js middleware patterns.

### ✅ Example

```js
// ── HOF: Takes a function as argument ──
const applyTwice = (fn, value) => fn(fn(value));
const double     = (x) => x * 2;
console.log(applyTwice(double, 3)); // 12

// ── HOF: Returns a function ──
const withLogging = (fn) => (...args) => {
  console.log("Calling with args:", args);
  const result = fn(...args);
  console.log("Result:", result);
  return result;
};

const add       = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(3, 4);
// Calling with args: [3, 4]
// Result: 7

// ── In Next.js — Higher-Order Component (HOC) ──
const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const isAuthenticated = checkAuth(); // your auth logic

    if (!isAuthenticated) return <redirect to="/login" />;
    return <WrappedComponent {...props} />;
  };
};

const ProtectedPage = withAuth(Dashboard);
```

### 🔑 Key Points
- HOFs **accept** and/or **return** functions
- Built-in HOFs: `.map()`, `.filter()`, `.reduce()`, `setTimeout()`, `addEventListener()`
- Enable **code reuse** by abstracting behavior into wrapper functions
- HOC (Higher-Order Component) pattern in React is built on this concept

---

## 16. JSON (parse & stringify)

### 📌 Explanation
JSON is the standard format for API data exchange. `JSON.parse()` converts JSON strings to JS objects, and `JSON.stringify()` converts JS objects to JSON strings.

### ✅ Example

```js
// ── JSON.stringify() — JS Object → JSON String ──
const user       = { name: "Tushar", age: 22, active: true };
const jsonString = JSON.stringify(user);
console.log(jsonString);
// '{"name":"Tushar","age":22,"active":true}'

// Pretty print with indentation
const pretty = JSON.stringify(user, null, 2);
/*
{
  "name": "Tushar",
  "age": 22,
  "active": true
}
*/

// ── JSON.parse() — JSON String → JS Object ──
const parsed = JSON.parse(jsonString);
console.log(parsed.name); // "Tushar"

// ── Deep Clone trick ──
const original  = { a: 1, nested: { b: 2 } };
const deepClone = JSON.parse(JSON.stringify(original));
deepClone.nested.b = 99;
console.log(original.nested.b); // 2 (original is unaffected)

// ── In Next.js API Route Handler ──
export async function POST(request) {
  const body = await request.json(); // parse JSON body
  const { name, email } = body;
  return Response.json({ message: "User created", name });
}
```

### 🔑 Key Points
- `JSON.stringify()` → object to **string** (sending over network / storing)
- `JSON.parse()` → string back to **object** (consuming received data)
- JSON keys must be **double-quoted** — not single quotes
- `undefined`, functions, and `Symbol` are **omitted** by `JSON.stringify()`
- In Next.js Route Handlers, use `request.json()` — it is already async!

---

## 17. Error Handling (try/catch/finally)

### 📌 Explanation
Critical for handling failed API calls, invalid data, or server errors in Next.js server components, API routes, and async operations.

### ✅ Example

```js
// ── Basic try/catch ──
try {
  const data = JSON.parse("invalid json{{{");
} catch (error) {
  console.error("Parse error:", error.message);
}

// ── Async try/catch ──
const fetchPost = async (id) => {
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch failed:", error.message);
    return null; // graceful fallback
  } finally {
    console.log("Fetch attempt complete"); // always runs
  }
};

// ── Custom Error Class ──
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

// ── In Next.js App Router ──
// app/error.js — catches thrown errors from Server Components
"use client";
const ErrorPage = ({ error, reset }) => (
  <div>
    <h2>Something went wrong!</h2>
    <p>{error.message}</p>
    <button onClick={reset}>Try again</button>
  </div>
);
export default ErrorPage;
```

### 🔑 Key Points
- `try` → code that might fail
- `catch(error)` → handle the error (`error.message`, `error.name`)
- `finally` → always runs (cleanup, loading state reset)
- In Next.js: `error.js` catches errors thrown from Server Components
- **Never** swallow errors silently — always log or re-throw

---

## 18. LocalStorage & SessionStorage

### 📌 Explanation
Browser storage APIs for persisting data client-side. Used in Next.js Client Components for themes, auth tokens, user preferences, and cart data.

### ✅ Example

```js
// ── LocalStorage (persists until cleared) ──
localStorage.setItem("theme", "dark");
localStorage.setItem("user", JSON.stringify({ name: "Tushar", role: "admin" }));

const theme = localStorage.getItem("theme");           // "dark"
const user  = JSON.parse(localStorage.getItem("user")); // { name: "Tushar", ... }

localStorage.removeItem("theme");
localStorage.clear(); // clear all

// ── SessionStorage (clears on tab close) ──
sessionStorage.setItem("tempToken", "abc123");
const token = sessionStorage.getItem("tempToken");

// ── In Next.js Client Component ──
"use client";
import { useState, useEffect } from "react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Read from localStorage on mount (client-side only)
    const savedTheme = localStorage.getItem("theme") ?? "light";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button onClick={toggleTheme}>
      Switch to {theme === "light" ? "Dark" : "Light"}
    </button>
  );
};
```

### 🔑 Key Points
- **localStorage** → persists across sessions, even after browser restart
- **sessionStorage** → clears when the tab is closed
- Only available in the **browser** — cannot use in Next.js Server Components
- Always access inside `useEffect` in Next.js to avoid SSR hydration errors
- Always `JSON.stringify()` objects before storing and `JSON.parse()` when reading

---

## 19. Callback Functions

### 📌 Explanation
A callback is a function passed as an argument to another function, to be called later. Foundation of event handling, timers, and asynchronous operations.

### ✅ Example

```js
// ── Basic Callback ──
const greet = (name, callback) => {
  console.log(`Hello, ${name}`);
  callback();
};
greet("Tushar", () => console.log("Callback fired!"));
// Hello, Tushar
// Callback fired!

// ── Array Method Callbacks ──
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((num) => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// ── Event Listener Callback ──
document.getElementById("btn").addEventListener("click", (event) => {
  console.log("Clicked!", event.target);
});

// ── setTimeout / setInterval ──
setTimeout(() => console.log("Runs after 2s"), 2000);
const intervalId = setInterval(() => console.log("Every second"), 1000);
clearInterval(intervalId); // stop the interval

// ── In Next.js ──
"use client";
const Form = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form submitted!");
  };

  const handleChange = (event) => {
    console.log(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### 🔑 Key Points
- Callbacks are functions **passed as arguments** — not called immediately
- Event handlers in JSX (`onClick`, `onChange`, `onSubmit`) are callbacks
- **Callback hell** problem → solved by Promises and async/await
- `useEffect`'s cleanup return is a callback: `return () => cleanup()`

---

## 20. Prototype & Class (OOP Basics)

### 📌 Explanation
Classes in JavaScript provide structure for creating objects with shared methods. Used in Next.js for custom Error classes, data models, and utility services.

### ✅ Example

```js
// ── ES6 Class ──
class Animal {
  constructor(name, sound) {
    this.name  = name;
    this.sound = sound;
  }

  speak() {
    return `${this.name} says ${this.sound}`;
  }

  static create(name, sound) { // Static method — called on the class, not instance
    return new Animal(name, sound);
  }
}

const dog = new Animal("Dog", "Woof");
console.log(dog.speak()); // Dog says Woof
console.log(Animal.create("Cat", "Meow").speak()); // Cat says Meow

// ── Inheritance ──
class Pet extends Animal {
  constructor(name, sound, owner) {
    super(name, sound); // Call parent constructor
    this.owner = owner;
  }

  info() {
    return `${this.speak()} — owned by ${this.owner}`;
  }
}

const myPet = new Pet("Buddy", "Bark", "Tushar");
console.log(myPet.info()); // Buddy says Bark — owned by Tushar

// ── Custom Error Class in Next.js API Route ──
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name       = "AppError";
    this.statusCode = statusCode;
  }
}

export async function GET() {
  try {
    throw new AppError("User not found", 404);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
}
```

### 🔑 Key Points
- `class` is syntactic sugar over JavaScript's **prototype chain**
- `constructor()` runs when `new ClassName()` is called
- `extends` → enables **inheritance** from a parent class
- `super()` → must be called in child `constructor` before accessing `this`
- `static` methods → belong to the **class**, not instances
- In Next.js: mostly used for **custom Error classes** and service/utility classes

---

## 🧭 Quick Reference Cheat Sheet

| Concept | Primary Use in Next.js |
|---|---|
| `import / export` | Every component, utility, and config file |
| Arrow Functions | Components, callbacks, inline handlers |
| Destructuring | Props, useState, API response parsing |
| Spread / Rest | State updates, prop forwarding |
| Template Literals | Dynamic URLs, class names, messages |
| `.map()` | Rendering lists from API data |
| `.filter()` | Filtering data before rendering |
| Async/Await | Data fetching in Server Components |
| `fetch()` | Calling APIs in both server and client |
| Optional Chaining | Safe access to nested API data |
| Nullish Coalescing | Fallback values for null/undefined data |
| Short-Circuit `&&` | Conditional rendering in JSX |
| Ternary `? :` | Inline conditional JSX |
| `JSON.parse/stringify` | API request bodies, localStorage |
| `try/catch` | Error handling in async server actions |
| `localStorage` | Client-side theme, auth, preferences |
| Closures | Hooks (`useState`, `useEffect`) internals |
| HOFs | `.map()`, HOCs, middleware wrappers |
| Callbacks | Event handlers, `useEffect` cleanup |
| Classes | Custom errors, service layer |

---

## 📚 Recommended Learning Order

```
1. Arrow Functions → Destructuring → Spread/Rest
         ↓
2. Template Literals → Array Methods (map, filter, reduce)
         ↓
3. Promises → Async/Await → Fetch API
         ↓
4. Optional Chaining → Nullish Coalescing → Short-Circuit
         ↓
5. Error Handling → JSON → LocalStorage
         ↓
6. Closures → HOFs → Classes
         ↓
         ✅  Ready for Next.js!
```

---

> 💡 **Pro Tip**: You do not need to master all of these before starting Next.js. Learn topics 1–4 deeply, then pick up the rest as you encounter them in real projects.

---

*Last Updated: October 2026 | Module 27 — Programming Hero Level 2*
