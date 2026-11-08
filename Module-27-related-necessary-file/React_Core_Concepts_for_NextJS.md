# ⚛️ React Core Concepts for Next.js

> A curated reference of essential React concepts you must know before or while learning Next.js. Each concept includes a short explanation, example code, and key points.

---

## Table of Contents

1. [JSX (JavaScript XML)](#1-jsx-javascript-xml)
2. [Components (Functional)](#2-components-functional)
3. [Props](#3-props)
4. [State — useState](#4-state--usestate)
5. [useEffect Hook](#5-useeffect-hook)
6. [Conditional Rendering](#6-conditional-rendering)
7. [List Rendering & Keys](#7-list-rendering--keys)
8. [Event Handling](#8-event-handling)
9. [Forms & Controlled Components](#9-forms--controlled-components)
10. [Component Composition & children](#10-component-composition--children)
11. [useRef Hook](#11-useref-hook)
12. [useContext Hook](#12-usecontext-hook)
13. [Custom Hooks](#13-custom-hooks)
14. [useMemo & useCallback](#14-usememo--usecallback)
15. [React.memo (Performance)](#15-reactmemo-performance)
16. [Lifting State Up](#16-lifting-state-up)
17. [Prop Drilling & Context](#17-prop-drilling--context)
18. [Error Boundaries](#18-error-boundaries)
19. [Fragments](#19-fragments)
20. [Portals](#20-portals)

---

## 1. JSX (JavaScript XML)

### 📌 Explanation
JSX is a syntax extension that lets you write HTML-like code in JavaScript. Next.js compiles JSX to regular JavaScript under the hood.

### ✅ Example

```jsx
// ── Basic JSX ──
const element = <h1>Hello, Next.js!</h1>;

// ── JSX with expressions ──
const name = "Tushar";
const greeting = <h1>Hello, {name}!</h1>; // embed JS with {}

// ── JSX rules: className instead of class ──
const Card = () => (
  <div className="card">
    <h2>Title</h2>
    <p>Description here</p>
  </div>
);

// ── JSX must return ONE parent element ──
// ❌ Wrong — two siblings
// return <h1>Hello</h1><p>World</p>;

// ✅ Correct — wrap in a parent
const App = () => (
  <div>
    <h1>Hello</h1>
    <p>World</p>
  </div>
);

// ── Self-closing tags MUST be closed ──
const Input = () => <input type="text" />;    // ✅
const Img   = () => <img src="logo.png" />;  // ✅

// ── Inline styles use objects ──
const Styled = () => (
  <p style={{ color: "blue", fontSize: "18px" }}>Styled text</p>
);
```

### 🔑 Key Points
- JSX is **not HTML** — it compiles to `React.createElement()` calls
- Use `className` (not `class`) and `htmlFor` (not `for`)
- All tags must be **properly closed** (`<br />`, `<img />`)
- Embed any JS expression inside `{ }` — but not statements (`if`, `for`)
- Must return **one root element** — use `<>...</>` fragments to avoid extra divs

---

## 2. Components (Functional)

### 📌 Explanation
Components are the building blocks of every React/Next.js app. A functional component is simply a JavaScript function that returns JSX.

### ✅ Example

```jsx
// ── Basic Functional Component ──
const Greeting = () => {
  return <h1>Hello from a Component!</h1>;
};

// ── With logic inside ──
const WelcomeCard = () => {
  const user = "Tushar";
  const isLoggedIn = true;

  return (
    <div className="card">
      <h2>Welcome, {user}!</h2>
      {isLoggedIn && <p>You are logged in ✅</p>}
    </div>
  );
};

// ── Export options ──
export default WelcomeCard;          // default export (one per file)
export const Button = () => <button>Click</button>; // named export

// ── In Next.js — every page.js is a component ──
// app/about/page.js
const AboutPage = () => {
  return (
    <main>
      <h1>About Us</h1>
      <p>We build great products.</p>
    </main>
  );
};
export default AboutPage;
```

### 🔑 Key Points
- Component names must start with a **Capital Letter** (`MyCard` not `myCard`)
- A component must **return JSX** (or `null` to render nothing)
- Keep components **small and focused** — one responsibility per component
- In Next.js App Router, components are **Server Components** by default
- Add `"use client"` at the top to make it a **Client Component** (for hooks, events)

---

## 3. Props

### 📌 Explanation
Props (properties) are how you pass data from a **parent** component to a **child** component. They are read-only — a child never modifies its own props.

### ✅ Example

```jsx
// ── Defining & Using Props ──
const UserCard = (props) => {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
      <p>Role: {props.role}</p>
    </div>
  );
};

// ── Destructuring Props (Preferred) ──
const UserCard = ({ name, age, role = "viewer" }) => (
  <div>
    <h2>{name}</h2>
    <p>Age: {age}</p>
    <p>Role: {role}</p>
  </div>
);

// ── Passing Props ──
const App = () => (
  <div>
    <UserCard name="Tushar" age={22} role="admin" />
    <UserCard name="Alice"  age={25} />  {/* role defaults to "viewer" */}
  </div>
);

// ── Passing different data types ──
const Demo = () => (
  <Component
    text="string"           // string (no curly braces needed)
    count={42}              // number
    isActive={true}         // boolean
    items={["a", "b"]}      // array
    user={{ name: "Bob" }}  // object
    onClick={() => alert("clicked!")} // function
  />
);
```

### 🔑 Key Points
- Props flow **one-way**: parent → child (unidirectional data flow)
- Props are **read-only** inside the child — never mutate them
- Always set **default values** for optional props via destructuring
- In Next.js, page components receive `params` and `searchParams` as props automatically
- Pass functions as props to communicate **child → parent** (callback pattern)

---

## 4. State — useState

### 📌 Explanation
State holds dynamic data that changes over time. When state changes, React **re-renders** the component to reflect the new values.

### ✅ Example

```jsx
"use client"; // Required for useState in Next.js
import { useState } from "react";

// ── Basic useState ──
const Counter = () => {
  const [count, setCount] = useState(0); // [value, setter]

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

// ── useState with Object ──
const ProfileForm = () => {
  const [form, setForm] = useState({ name: "", email: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value }); // spread + update
  };

  return (
    <form>
      <input name="name"  value={form.name}  onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
      <p>Hello, {form.name}</p>
    </form>
  );
};

// ── useState with Array ──
const TodoList = () => {
  const [todos, setTodos] = useState(["Buy milk", "Study React"]);

  const addTodo = (item) => setTodos([...todos, item]);
  const removeTodo = (index) => setTodos(todos.filter((_, i) => i !== index));

  return (
    <ul>
      {todos.map((todo, i) => (
        <li key={i}>
          {todo} <button onClick={() => removeTodo(i)}>✕</button>
        </li>
      ))}
    </ul>
  );
};
```

### 🔑 Key Points
- `const [value, setValue] = useState(initialValue)`
- **Never mutate state directly** → `state.count = 1` ❌ — always use the setter
- State updates are **asynchronous** — batch multiple updates
- Always use **spread** when updating objects/arrays: `{ ...prev, key: newVal }`
- In Next.js, `useState` only works in **Client Components** (`"use client"`)

---

## 5. useEffect Hook

### 📌 Explanation
`useEffect` runs **side effects** after render — fetching data, setting up subscriptions, interacting with the DOM, or starting timers.

### ✅ Example

```jsx
"use client";
import { useState, useEffect } from "react";

// ── Runs after EVERY render ──
useEffect(() => {
  console.log("Component rendered");
});

// ── Runs ONCE on mount (empty dependency array) ──
useEffect(() => {
  console.log("Component mounted");
}, []);

// ── Runs when 'count' changes ──
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

// ── Data Fetching with useEffect ──
const PostList = () => {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res  = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await res.json();
        setPosts(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // run once on mount

  if (loading) return <p>Loading...</p>;
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
};

// ── Cleanup Function ──
useEffect(() => {
  const timer = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(timer); // cleanup on unmount
}, []);
```

### 🔑 Key Points
- `[]` → runs **once** (on mount) — fetch initial data, set up listeners
- `[dep]` → runs when **dependency changes**
- No array → runs after **every render** (rare use case)
- The **return function** is the cleanup — runs before unmount or re-run
- In Next.js: prefer **Server Component** data fetching over `useEffect` for initial data
- `useEffect` only runs in **Client Components** (`"use client"`)

---

## 6. Conditional Rendering

### 📌 Explanation
React lets you conditionally render components or elements based on state or props — using ternary, `&&`, or `if` statements.

### ✅ Example

```jsx
"use client";
import { useState } from "react";

// ── Using Ternary ──
const Alert = ({ type, message }) => (
  <div className={type === "success" ? "alert-success" : "alert-error"}>
    {type === "success" ? "✅ " : "❌ "}
    {message}
  </div>
);

// ── Using && ──
const Notification = ({ count }) => (
  <div>
    <h1>Inbox</h1>
    {count > 0 && <span>🔔 {count} unread messages</span>}
  </div>
);

// ── Using if / early return ──
const UserGreeting = ({ isLoggedIn, user }) => {
  if (!isLoggedIn) return <p>Please <a href="/login">log in</a>.</p>;
  return <p>Welcome back, {user.name}!</p>;
};

// ── Loading / Error / Data states ──
const DataView = ({ loading, error, data }) => {
  if (loading) return <p>⏳ Loading...</p>;
  if (error)   return <p>❌ Error: {error.message}</p>;
  if (!data)   return <p>No data found.</p>;

  return <div>{data.title}</div>;
};
```

### 🔑 Key Points
- Use `condition && <JSX />` for **show/hide** (no else)
- Use `condition ? <A /> : <B />` for **either/or** rendering
- Use `if` with **early return** for complex conditions — keeps JSX clean
- `null` or `false` renders nothing — safe to use as fallback
- Avoid rendering `0` accidentally — use `count > 0 && ...` not `count && ...`

---

## 7. List Rendering & Keys

### 📌 Explanation
Use `.map()` to render lists of data. React requires a unique `key` prop on each list item to efficiently update the DOM.

### ✅ Example

```jsx
// ── Basic List Rendering ──
const colors = ["Red", "Green", "Blue"];

const ColorList = () => (
  <ul>
    {colors.map((color, index) => (
      <li key={index}>{color}</li>  // index as key (ok for static lists)
    ))}
  </ul>
);

// ── With Objects — use unique IDs as keys ──
const products = [
  { id: "p1", name: "Laptop",  price: 1200 },
  { id: "p2", name: "Phone",   price: 800  },
  { id: "p3", name: "Tablet",  price: 500  },
];

const ProductList = () => (
  <div>
    {products.map((product) => (
      <div key={product.id} className="product-card">  {/* ✅ stable unique key */}
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    ))}
  </div>
);

// ── Filtering before rendering ──
const InStockList = ({ items }) => (
  <ul>
    {items
      .filter((item) => item.inStock)
      .map((item) => <li key={item.id}>{item.name}</li>)
    }
  </ul>
);

// ── In Next.js with server data ──
const Page = async () => {
  const res   = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await res.json();
  return (
    <ul>
      {users.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
};
```

### 🔑 Key Points
- Always provide a **`key` prop** when using `.map()` — React uses it to track items
- Use a **stable unique ID** (from database/API) as key — not array index when list can reorder
- Keys must be **unique among siblings** — not globally
- Never use random numbers (`Math.random()`) as keys — causes re-render issues
- `.filter().map()` is the standard pattern for filtered list rendering

---

## 8. Event Handling

### 📌 Explanation
React uses synthetic events — a cross-browser wrapper around native DOM events. Event handlers are passed as JSX props (camelCase).

### ✅ Example

```jsx
"use client";

// ── Click Event ──
const ClickDemo = () => {
  const handleClick = () => alert("Button clicked!");
  return <button onClick={handleClick}>Click Me</button>;
};

// ── Event object ──
const InputDemo = () => {
  const handleChange = (event) => {
    console.log("Value:", event.target.value);
    console.log("Name:", event.target.name);
  };
  return <input name="username" onChange={handleChange} />;
};

// ── Prevent Default ──
const FormDemo = () => {
  const handleSubmit = (e) => {
    e.preventDefault(); // stop page reload
    console.log("Form submitted!");
  };
  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  );
};

// ── Passing arguments to handlers ──
const ItemList = ({ items }) => {
  const handleDelete = (id, e) => {
    e.stopPropagation();
    console.log("Delete item:", id);
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => console.log("Item clicked")}>
          {item.name}
          <button onClick={(e) => handleDelete(item.id, e)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};
```

### 🔑 Key Points
- React event names are **camelCase**: `onClick`, `onChange`, `onSubmit`, `onKeyDown`
- Pass the **function reference**, not the call: `onClick={handler}` not `onClick={handler()}`
- Use `e.preventDefault()` to stop default browser behavior (form submit, link navigation)
- Use `e.stopPropagation()` to prevent **event bubbling** to parent elements
- Event handlers in Next.js are only available in **Client Components**

---

## 9. Forms & Controlled Components

### 📌 Explanation
A controlled component keeps form input values in React state. The state is the single source of truth for the input's value.

### ✅ Example

```jsx
"use client";
import { useState } from "react";

// ── Controlled Input ──
const ControlledForm = () => {
  const [formData, setFormData] = useState({
    name:     "",
    email:    "",
    password: "",
    role:     "user",
    agree:    false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Full Name"
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <label>
        <input
          type="checkbox"
          name="agree"
          checked={formData.agree}
          onChange={handleChange}
        />
        I agree to terms
      </label>
      <button type="submit" disabled={!formData.agree}>Submit</button>
    </form>
  );
};
```

### 🔑 Key Points
- **Controlled**: `value` + `onChange` → React state drives the input
- **Uncontrolled**: use `useRef` or `defaultValue` (React doesn't track the value)
- Use `[e.target.name]: e.target.value` with spread for multi-field forms
- For checkboxes, use `e.target.checked` not `e.target.value`
- In Next.js App Router, also explore **Server Actions** (`action` prop on `<form>`)

---

## 10. Component Composition & children

### 📌 Explanation
Composition is React's pattern for building complex UIs from smaller, reusable pieces. The `children` prop lets you pass JSX content between component tags.

### ✅ Example

```jsx
// ── children Prop ──
const Card = ({ children, title }) => (
  <div className="card">
    {title && <h2 className="card-title">{title}</h2>}
    <div className="card-body">{children}</div>
  </div>
);

// Usage — anything between <Card>...</Card> becomes children
const App = () => (
  <div>
    <Card title="User Info">
      <p>Name: Tushar</p>
      <p>Role: Admin</p>
    </Card>

    <Card>
      <img src="photo.jpg" alt="Profile" />
      <button>Follow</button>
    </Card>
  </div>
);

// ── Slot Pattern (multiple content areas) ──
const Layout = ({ header, sidebar, children }) => (
  <div className="layout">
    <header>{header}</header>
    <aside>{sidebar}</aside>
    <main>{children}</main>
  </div>
);

const Page = () => (
  <Layout
    header={<nav>My App Nav</nav>}
    sidebar={<ul><li>Link 1</li></ul>}
  >
    <h1>Main Content</h1>
  </Layout>
);
```

### 🔑 Key Points
- `children` is a **special prop** automatically set to the content between tags
- Enables building **layout wrapper** components (very common in Next.js)
- Prefer composition over inheritance in React
- In Next.js, `app/layout.js` uses `children` to wrap all pages
- Use named props for **multiple slots** (header, sidebar, footer)

---

## 11. useRef Hook

### 📌 Explanation
`useRef` gives you a mutable reference that persists across renders without triggering a re-render. Used for DOM access, storing previous values, or timers.

### ✅ Example

```jsx
"use client";
import { useRef, useState, useEffect } from "react";

// ── DOM Access ──
const FocusInput = () => {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current.focus(); // directly interact with DOM node
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="Click button to focus" />
      <button onClick={handleFocus}>Focus Input</button>
    </div>
  );
};

// ── Store mutable value (no re-render) ──
const Timer = () => {
  const [seconds, setSeconds]  = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const stop = () => clearInterval(intervalRef.current);

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
};

// ── Track previous state value ──
const PreviousValue = ({ value }) => {
  const prevRef = useRef();
  useEffect(() => { prevRef.current = value; });

  return <p>Current: {value} | Previous: {prevRef.current}</p>;
};
```

### 🔑 Key Points
- `useRef(initialValue)` → returns `{ current: initialValue }`
- Changing `ref.current` does **NOT trigger a re-render** (unlike `useState`)
- Use to access **DOM nodes** directly (`ref.current.focus()`, `.scrollIntoView()`)
- Ideal for storing **interval/timeout IDs**, previous values, or animation frames
- `useRef` only works in **Client Components** in Next.js

---

## 12. useContext Hook

### 📌 Explanation
Context provides a way to pass data through the component tree **without prop drilling**. `useContext` consumes context values from any nested component.

### ✅ Example

```jsx
"use client";
import { createContext, useContext, useState } from "react";

// ── 1. Create Context ──
const ThemeContext = createContext("light"); // default value

// ── 2. Create Provider Component ──
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ── 3. Consume Context with useContext ──
const ThemeButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{ background: theme === "dark" ? "#333" : "#fff" }}
    >
      Current: {theme}
    </button>
  );
};

// ── 4. Wrap app with Provider ──
// app/layout.js (Next.js)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// ── Custom Hook for cleaner usage ──
export const useTheme = () => useContext(ThemeContext);
```

### 🔑 Key Points
- Three steps: **Create** → **Provide** → **Consume**
- Context re-renders all consumers when its value changes — use wisely
- Good for: **theme, auth, language, cart** — global but not frequently changing data
- For complex global state, consider **Zustand** or **Redux Toolkit**
- In Next.js, context providers must be **Client Components**

---

## 13. Custom Hooks

### 📌 Explanation
Custom hooks are reusable functions that encapsulate stateful logic and can use built-in hooks inside. They follow the `use` prefix naming convention.

### ✅ Example

```jsx
"use client";
import { useState, useEffect } from "react";

// ── useFetch — reusable data fetching hook ──
const useFetch = (url) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; }; // cleanup
  }, [url]);

  return { data, loading, error };
};

// ── useLocalStorage — persist state in localStorage ──
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue];
};

// ── Usage ──
const PostsPage = () => {
  const { data: posts, loading, error } = useFetch(
    "https://jsonplaceholder.typicode.com/posts"
  );

  const [theme, setTheme] = useLocalStorage("theme", "light");

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error.message}</p>;

  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
};
```

### 🔑 Key Points
- Must start with **`use`** prefix — React enforces hook rules on them
- Can use **other hooks** inside (`useState`, `useEffect`, `useRef`, etc.)
- Can accept **parameters** and **return** any value (object, array, primitive)
- Promote **DRY** — reuse logic across multiple components
- Common custom hooks: `useFetch`, `useDebounce`, `useToggle`, `useLocalStorage`

---

## 14. useMemo & useCallback

### 📌 Explanation
Performance optimization hooks. `useMemo` caches a **computed value**; `useCallback` caches a **function reference**. Both prevent unnecessary recalculations/re-renders.

### ✅ Example

```jsx
"use client";
import { useState, useMemo, useCallback } from "react";

// ── useMemo — cache expensive computation ──
const ProductList = ({ products, filterText }) => {
  // Only recalculates when 'products' or 'filterText' changes
  const filteredProducts = useMemo(() => {
    console.log("Filtering..."); // won't run on every render
    return products.filter((p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [products, filterText]);

  return (
    <ul>
      {filteredProducts.map((p) => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
};

// ── useCallback — cache a function ──
const Parent = () => {
  const [count, setCount] = useState(0);
  const [name,  setName]  = useState("");

  // Without useCallback → new function created every render → Child re-renders
  // With useCallback    → same function reference → Child skips re-render
  const handleSubmit = useCallback((value) => {
    console.log("Submitted:", value);
  }, []); // no deps → same function forever

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <MemoizedChild onSubmit={handleSubmit} />
    </div>
  );
};

const MemoizedChild = React.memo(({ onSubmit }) => {
  console.log("Child rendered");
  return <button onClick={() => onSubmit("test")}>Submit</button>;
});
```

### 🔑 Key Points
- `useMemo(fn, deps)` → returns a **memoized value**
- `useCallback(fn, deps)` → returns a **memoized function**
- Both only recompute when **dependencies change**
- Don't overuse — premature optimization adds complexity. Profile first!
- `useCallback` is most effective when passed to **`React.memo`-wrapped** child components

---

## 15. React.memo (Performance)

### 📌 Explanation
`React.memo` is a higher-order component that **skips re-rendering** a component if its props haven't changed — useful for expensive child components.

### ✅ Example

```jsx
import { memo, useState } from "react";

// ── Without memo — re-renders every time parent renders ──
const ExpensiveComponent = ({ data }) => {
  console.log("ExpensiveComponent rendered");
  return <div>{data.title}</div>;
};

// ── With memo — only re-renders when 'data' prop changes ──
const MemoizedComponent = memo(({ data }) => {
  console.log("MemoizedComponent rendered");
  return <div>{data.title}</div>;
});

// ── Custom comparison function ──
const SmartComponent = memo(
  ({ user }) => <div>{user.name}</div>,
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
  // return true → skip re-render
  // return false → re-render
);

// ── Full Example ──
const Parent = () => {
  const [count, setCount]   = useState(0);
  const [title, setTitle]   = useState("Hello");

  const data = useMemo(() => ({ title }), [title]); // stable reference

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        Count: {count}  {/* Clicking this won't re-render MemoizedComponent */}
      </button>
      <MemoizedComponent data={data} />
    </div>
  );
};
```

### 🔑 Key Points
- `React.memo` compares props **shallowly** by default
- For object/function props, use `useMemo`/`useCallback` to maintain **stable references**
- Most useful for **list items**, **heavy visualizations**, or components with many props
- Don't wrap every component — measure first, optimize when needed
- Works alongside `useCallback` and `useMemo` for a complete optimization strategy

---

## 16. Lifting State Up

### 📌 Explanation
When multiple components need to share state, move the state to their **closest common parent**. The parent then passes state and setters down as props.

### ✅ Example

```jsx
"use client";
import { useState } from "react";

// ── Child components that share state ──
const TemperatureInput = ({ label, value, onChange }) => (
  <label>
    {label}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </label>
);

const BoilingPoint = ({ celsius }) => (
  <p>{celsius >= 100 ? "💧 Water is boiling!" : "Water is not boiling."}</p>
);

// ── Parent holds the shared state ──
const TemperatureConverter = () => {
  const [celsius, setCelsius] = useState(0); // state lives in parent

  const fahrenheit = (celsius * 9) / 5 + 32;

  return (
    <div>
      <TemperatureInput
        label="Celsius: "
        value={celsius}
        onChange={setCelsius}         // setter passed down as prop
      />
      <TemperatureInput
        label="Fahrenheit: "
        value={fahrenheit}
        onChange={(f) => setCelsius((f - 32) * 5 / 9)}
      />
      <BoilingPoint celsius={celsius} />
    </div>
  );
};
```

### 🔑 Key Points
- Move state to the **lowest common ancestor** of components that need it
- The parent **owns** the state — children receive it as props
- Children communicate back via **callback props** (onchange, onSubmit, etc.)
- This is the React way before Context/global state — good for localized sharing
- In Next.js: use Server Components to co-locate data with layout where possible

---

## 17. Prop Drilling & Context

### 📌 Explanation
Prop drilling = passing data through many layers of components that don't use it, just to reach a deeply nested child. Context solves this problem.

### ✅ Example

```jsx
// ── Prop Drilling Problem ──
// GrandParent → Parent → Child → DeepChild (all must pass 'user')
const GrandParent = () => {
  const user = { name: "Tushar", role: "admin" };
  return <Parent user={user} />;   // passes user down
};

const Parent = ({ user }) => <Child user={user} />; // just passes it along
const Child  = ({ user }) => <DeepChild user={user} />; // just passes it along
const DeepChild = ({ user }) => <p>Hello, {user.name}!</p>; // finally uses it

// ── Context Solution — skip intermediate components ──
import { createContext, useContext } from "react";

const UserContext = createContext(null);

const GrandParentWithContext = () => {
  const user = { name: "Tushar", role: "admin" };
  return (
    <UserContext.Provider value={user}>
      <ParentC />          {/* doesn't receive user prop */}
    </UserContext.Provider>
  );
};

const ParentC   = () => <ChildC />;   // no user prop needed
const ChildC    = () => <DeepChildC />; // no user prop needed
const DeepChildC = () => {
  const user = useContext(UserContext); // directly consumes context
  return <p>Hello, {user.name}!</p>;
};
```

### 🔑 Key Points
- Prop drilling is not always bad — 1-2 levels is fine
- Context eliminates the need to pass props through intermediate components
- Overusing Context can make data flow harder to trace — use judiciously
- Alternatives: **Zustand**, **Redux Toolkit**, **Jotai** for complex global state
- In Next.js: some data can be passed via **server-side props** instead of Context

---

## 18. Error Boundaries

### 📌 Explanation
Error Boundaries catch JavaScript errors in the component tree during rendering, preventing the entire app from crashing. In Next.js, `error.js` serves as the automatic error boundary.

### ✅ Example

```jsx
// ── Class-based Error Boundary (React requirement) ──
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-ui">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
const App = () => (
  <ErrorBoundary>
    <RiskyComponent />
  </ErrorBoundary>
);

// ── In Next.js (App Router) — automatic error boundary ──
// app/dashboard/error.js
"use client"; // Must be a Client Component
const DashboardError = ({ error, reset }) => (
  <div>
    <h2>Dashboard failed to load</h2>
    <p>{error.message}</p>
    <button onClick={reset}>Retry</button>
  </div>
);
export default DashboardError;
```

### 🔑 Key Points
- Error boundaries only catch errors during **rendering** — not in event handlers or async code
- Must be a **class component** (no hooks equivalent for boundaries yet)
- `getDerivedStateFromError` → update state to show fallback UI
- `componentDidCatch` → log errors to an error reporting service
- In Next.js App Router, `error.js` is the **automatic error boundary** for a route segment

---

## 19. Fragments

### 📌 Explanation
Fragments let you group multiple elements without adding an extra DOM node — keeps the HTML clean and avoids unnecessary wrapper divs.

### ✅ Example

```jsx
import { Fragment } from "react";

// ── Problem: Extra wrapper div ──
const WithDiv = () => (
  <div>   {/* extra unwanted div in DOM */}
    <h1>Title</h1>
    <p>Paragraph</p>
  </div>
);

// ── Solution 1: Long syntax (supports key prop) ──
const WithFragment = () => (
  <Fragment>
    <h1>Title</h1>
    <p>Paragraph</p>
  </Fragment>
);

// ── Solution 2: Short syntax (most common) ──
const WithShortFragment = () => (
  <>
    <h1>Title</h1>
    <p>Paragraph</p>
  </>
);

// ── Fragment with key (for lists) ──
const DefinitionList = ({ items }) => (
  <dl>
    {items.map((item) => (
      <Fragment key={item.id}>     {/* key on <Fragment>, not wrapper div */}
        <dt>{item.term}</dt>
        <dd>{item.definition}</dd>
      </Fragment>
    ))}
  </dl>
);
```

### 🔑 Key Points
- `<>...</>` is shorthand for `<React.Fragment>...</React.Fragment>`
- No extra nodes are added to the **real DOM**
- Use `<Fragment key={id}>` (long form) when you need a `key` prop in lists
- Great for **table rows**, **definition lists**, or returning multiple elements
- Helps maintain valid HTML structure (e.g., `<tr>` inside `<table>` without extra wrappers)

---

## 20. Portals

### 📌 Explanation
Portals render a component's JSX **outside** its parent DOM hierarchy — but it still behaves like a React child (events bubble normally). Perfect for modals, tooltips, and drawers.

### ✅ Example

```jsx
"use client";
import { useState } from "react";
import { createPortal } from "react-dom";

// ── Portal Component ──
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // Renders into document.body instead of its parent div
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}  // prevent closing on content click
      >
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>,
    document.body  // portal target
  );
};

// ── Usage ──
const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ overflow: "hidden" }}> {/* overflow won't clip the modal */}
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Portal Modal</h2>
        <p>I'm rendered in document.body, not inside the parent div!</p>
      </Modal>
    </div>
  );
};
```

### 🔑 Key Points
- `createPortal(jsx, domNode)` — renders JSX into any DOM node
- Common portal targets: `document.body`, a dedicated `#modal-root` div
- Events still **bubble up** through the React component tree (not the DOM tree)
- Solves **z-index** and **overflow: hidden** clipping issues for modals/tooltips
- In Next.js, access `document` inside `useEffect` or after mount to avoid SSR errors

---

## 🧭 Quick Reference Cheat Sheet

| Concept | Primary Use in Next.js |
|---|---|
| JSX | Every component, page, and layout file |
| Components | Building blocks — pages, layouts, UI elements |
| Props | Passing data parent → child |
| useState | Dynamic UI state (counter, form, toggle) |
| useEffect | Client-side data fetch, subscriptions, timers |
| Conditional Rendering | Show/hide UI based on state or data |
| List Rendering & Keys | Rendering arrays of data from APIs |
| Event Handling | `onClick`, `onChange`, `onSubmit` in Client Components |
| Forms (Controlled) | Login forms, search, user inputs |
| children / Composition | Layouts, wrapper components, `layout.js` |
| useRef | DOM access, intervals, previous values |
| useContext | Global state — theme, auth, language |
| Custom Hooks | Reusable logic — `useFetch`, `useDebounce` |
| useMemo | Cache expensive computed values |
| useCallback | Stable function references for memoized children |
| React.memo | Skip re-renders for pure child components |
| Lifting State Up | Sharing state between sibling components |
| Prop Drilling / Context | Avoiding deep prop chains |
| Error Boundaries | `error.js` — graceful error UI per route |
| Fragments | Avoid wrapper divs in JSX output |
| Portals | Modals, tooltips rendered outside parent DOM |

---

## 📌 Next.js-Specific React Distinctions

| React Concept | Next.js Behavior |
|---|---|
| All components are client | App Router: **Server Components** by default |
| `useEffect` for data | Use `async/await` directly in Server Components |
| No built-in routing | File-based routing in `app/` or `pages/` directory |
| Manual error UI | `error.js` is automatic error boundary per segment |
| Manual loading state | `loading.js` is automatic loading boundary per segment |
| Single `index.html` | Full SSR/SSG/ISR support per page |
| Context everywhere | Server Components can't use Context — wrap in Client Provider |

---

## 📚 Recommended Learning Order

```
1. JSX → Components → Props
         ↓
2. useState → Event Handling → Forms
         ↓
3. useEffect → Conditional Rendering → List Rendering
         ↓
4. children/Composition → Fragments → Lifting State Up
         ↓
5. useContext → useRef → Custom Hooks
         ↓
6. useMemo → useCallback → React.memo
         ↓
7. Error Boundaries → Portals
         ↓
         ✅  Ready for Next.js Advanced Features!
```

---

> 💡 **Pro Tip**: In Next.js App Router, start with Server Components (no hooks needed!). Only reach for `"use client"` and React hooks when you need interactivity, browser APIs, or real-time updates.

---

*Last Updated: October 2026 | Module 27 — Programming Hero Level 2*
