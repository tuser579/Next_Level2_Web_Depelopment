# Module-6: Node.js Server (Raw HTTP)

## Summary of this module:
This module focuses on building a fundamental backend API using raw Node.js, specifically the built-in `http` module, without relying on frameworks like Express. It teaches the core mechanics of how servers handle requests and responses, route traffic, parse data streams, and interact with the file system for data storage.

The project is structured logically into different layers (`routes`, `controller`, `service`, `utility`) to promote clean code and separation of concerns.

## Learning Objectives & Key Concepts Covered:

1. **Creating an HTTP Server:** Using `http.createServer()` to listen for incoming requests.
2. **Manual Routing:** Handling different API endpoints by inspecting `req.url` and `req.method`.
3. **Handling Request Streams:** Parsing incoming JSON request bodies chunk-by-chunk using `req.on("data")` and `req.on("end")`.
4. **File System (FS) as Database:** Using `fs.readFileSync` and `fs.writeFileSync` to persist data in a `db.json` file.
5. **Building a Full CRUD API:** Implementing Create (POST), Read (GET), Update (PUT), and Delete (DELETE) operations for a "products" resource.
6. **MVC-like Architecture:** Separating responsibilities into Controllers (request handling), Services (business logic & DB interaction), and Utilities (helper functions).
7. **Building a REST API:** Implementing CRUD operations for a "products" resource using raw Node.js.
8. **Utility Functions:** Using utility functions to handle common tasks like parsing request bodies and sending responses.
9. **Error Handling:** Handling errors gracefully and sending appropriate responses to the client.
10. **Type Safety:** Using TypeScript to ensure type safety and catch errors at compile time.
11. **Async/Await:** Using async/await to handle asynchronous operations.
12. **Arrow Functions:** Using arrow functions for concise syntax.
13. **dotenv:** Using dotenv to manage environment variables.

---

## Code Examples

### 1. Basic Server Setup (`server.ts`)
Creating the server and delegating requests to a route handler.

```typescript
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { routeHandler } from "./routes/route";

const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // Pass the request and response objects to our custom router
    routeHandler(req, res);
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### 2. Manual Routing (`routes/route.ts`)
Directing traffic based on the URL and HTTP Method.

```typescript
import type { IncomingMessage, ServerResponse } from "http";
import { productController } from "../controller/product.controller";

export const routeHandler = (req: IncomingMessage, res: ServerResponse ) => {
    const url = req.url;
    const method = req.method;

    if (url === "/" && method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Welcome to the root route!" }));
    }
    else if (url?.startsWith('/products')) {
        // Delegate to the product controller
        productController(req, res);
    }
    else {
        // Handle 404 Not Found
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route Not Found." }));
    }
}
```

### 3. Parsing Request Body Streams (`utility/parseBody.ts`)
Since raw Node.js doesn't parse JSON bodies automatically, we have to collect the data chunks manually.

```typescript
import type { IncomingMessage } from "http";

export const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = "";
    
    // Listen for data chunks
    req.on("data", (chunk) => {
      body += chunk;
    });
    
    // When all data is received, parse it as JSON
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};
```

### 4. Controller Logic Example (`controller/product.controller.ts`)
Handling a POST request to create a new product.

```typescript
import type { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utility/parseBody";
import { insertProduct, readProduct } from "../service/product.service";
import { sendResponse } from "../utility/sendResponse";

export const productController = async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url;
    const method = req.method;

    if (method === 'POST' && url === '/products') {
        try {
            // 1. Parse incoming data
            const body = await parseBody(req);
            
            // 2. Generate new ID
            const newProduct = { id: readProduct().length + 1, ...body };
            
            // 3. Save to "database" (file system)
            insertProduct(newProduct);
            
            // 4. Send success response
            return sendResponse(res, 200, true, "Product created successfully", { newProduct });
        } catch (error) {
            return sendResponse(res, 500, false, "Failed to create product!", error);
        }
    }
    // ... handling other routes (GET, PUT, DELETE)
};
```

### 5. File System as Database (`service/product.service.ts`)
Reading from and writing to a `db.json` file.

```typescript
import fs from "fs";
import path from "path";
import type { IProduct } from "../types/product.type";

const filePath = path.join(process.cwd(), "./src/database/db.json");

export const readProduct = () => {
    // Read the file synchronously and parse it into an object/array
    const products = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(products);
}

export const insertProduct = (newProduct: IProduct) => {
    // Get existing data, push new item, then overwrite the file
    const allProducts = readProduct();
    allProducts.push(newProduct);
    fs.writeFileSync(filePath, JSON.stringify(allProducts, null, 2));
    
    return allProducts;
}
```
### 6. MVC-like Architecture (`controller/product.controller.ts` and `service/product.service.ts`)
Separating business logic from request handling.

```typescript
// Controller
export const productController = async (req: IncomingMessage, res: ServerResponse) => {
    // Request handling logic
}

// Service
export const insertProduct = (newProduct: IProduct) => {
    // Business logic and database interaction
}
```
### 7. Building a REST API (`controller/product.controller.ts`)
Implementing CRUD operations for a "products" resource using raw Node.js.

```typescript
import type { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utility/parseBody";
import { insertProduct, readProduct, updateProduct, deleteProduct } from "../service/product.service";
import { sendResponse } from "../utility/sendResponse";

export const productController = async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url;
    const method = req.method;

    if (method === 'POST' && url === '/products') {
        try {
            const body = await parseBody(req);
            const newProduct = { id: readProduct().length + 1, ...body };
            insertProduct(newProduct);
            return sendResponse(res, 200, true, "Product created successfully", { newProduct });
        } catch (error) {
            return sendResponse(res, 500, false, "Failed to create product!", error);
        }
    }
    // ... handling other routes (GET, PUT, DELETE)
};
```
### 8. Utility Functions (`utility/parseBody.ts` and `utility/sendResponse.ts`)
Using utility functions to handle common tasks like parsing request bodies and sending responses.

```typescript
// Parse request body
export const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Send response
export const sendResponse = (res: ServerResponse, statusCode: number, success: boolean, message: string, data?: any) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success, message, data }));
};
```
### 9. Error Handling (`controller/product.controller.ts`)
Handling errors gracefully and sending appropriate responses to the client.

```typescript
try {
    // Code that may throw an error
    const result = await someAsyncOperation();
    sendResponse(res, 200, true, "Operation successful", result);
} catch (error) {
    // Handle error
    console.error("Error:", error);
    sendResponse(res, 500, false, "Operation failed", error);
}
```
### 10. Type Safety (`types/product.type.ts` and controller usage)
Using TypeScript to ensure type safety and catch errors at compile time.

```typescript
// Define product type
export interface IProduct {
    id: number;
    name: string;
    price: number;
    stock: number;
}

// Usage in controller
const newProduct: IProduct = { 
    id: 1, 
    name: "Product 1", 
    price: 100, 
    stock: 10 
};
```
### 11. Async/Await (`controller/product.controller.ts`)
Using async/await to handle asynchronous operations.

```typescript
export const productController = async (req: IncomingMessage, res: ServerResponse) => {
    // Async operation with await
    const body = await parseBody(req);
    
    // Another async operation
    const result = await someAsyncOperation();
    
    // Send response
    sendResponse(res, 200, true, "Operation successful", result);
};
```
### 12. Arrow Functions (`controller/product.controller.ts`)
Using arrow functions for concise syntax.

```typescript
// Arrow function for route handler
export const productController = async (req: IncomingMessage, res: ServerResponse) => {
    // Arrow function for parsing body
    const parseBody = (req: IncomingMessage): Promise<any> => {
        return new Promise((resolve, reject) => {
            // Arrow function for event handler
            req.on("data", (chunk) => {
                // Arrow function for another event handler
                req.on("end", () => {
                    // Arrow function for callback
                    resolve(JSON.parse(chunk));
                });
            });
        });
    };
};
```
### 13. dotenv (`config/index.ts`)
Using dotenv to manage environment variables.

```typescript
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const config = {
    port: process.env.PORT
} as const;

export default config;
```

