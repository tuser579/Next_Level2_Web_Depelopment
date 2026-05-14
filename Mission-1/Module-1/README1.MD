# Summary of this module:

## Learning from this module:
1. Array, tuple, object
2. Union, intersection
3. String and number literal types
4. Non-primitive types
5. Primitive types
6. Optional, read only, and never type
7. Destructure array and object
8. Spread operator
9. Type alias and type guards
10. Type system
11. Rest parameters
12. Function return types


## Example: 
### 1.Array, Tuple, Object

```typescript
// Array
const numbers: number[] = [1, 2, 3, 4, 5];
const names: string[] = ["John", "Jane", "Bob"];

// Tuple
const person: [string, number] = ["John", 25];

// Object
const user: { name: string; age: number } = {
    name: "John",
    age: 25,
};
```

### 2. Union and Intersection

```typescript
// Union
const id: string | number = 123;

// Intersection
const user: { name: string } & { age: number } = {
    name: "John",
    age: 25,
};
```

### 3. String and Number Literal Types

```typescript
// String literal
let status: "success" | "error" = "success";

// Number literal
let statusCode: 200 | 404 | 500 = 200;
```

### 4. Non-Primitive Types

```typescript
// Non-primitive types
const arr: number[] = [1, 2, 3];
const obj: { name: string } = { name: "John" };
const func: (a: number) => number = (a) => a + 1;
```

### 5. Primitive Types

```typescript
// Primitive types
let name: string = "John";
let age: number = 25;
let isActive: boolean = true;
let nothing: null = null;
let notAssigned: undefined = undefined;
let bigNumber: bigint = 12345678901234567890n;
let symbol: symbol = Symbol("id");
```

### 6. Optional, Readonly, and Never Type

```typescript
// Optional
let age?: number = 25;

// Readonly
const person: { readonly name: string } = { name: "John" };
person.name = "Jane"; // Error

// Never
function throwError(): never {
    throw new Error("Error");
}
```

### 7. Destructure Array and Object

```typescript
// Destructure array
const numbers: number[] = [1, 2, 3, 4, 5];
const [first, second] = numbers;

// Destructure object
const user: { name: string; age: number } = {
    name: "John",
    age: 25,
};
const { name, age } = user;
```

### 8. Spread Operator

```typescript
// Spread array
const numbers: number[] = [1, 2, 3, 4, 5];
const newNumbers: number[] = [...numbers, 6, 7, 8];

// Spread object
const user: { name: string; age: number } = {
    name: "John",
    age: 25,
};
const newUser: { name: string; age: number; city: string } = {
    ...user,
    city: "New York",
};
```

### 9. Type Alias and Type Guards

```typescript
// Type alias
type Person = {
    name: string;
    age: number;
};

// Type guards
function isPerson(value: any): value is Person {
    return typeof value === "object" && "name" in value && "age" in value;
}
```

### 10. Type System

```typescript
// Type system
const name: string = "John";
const age: number = 25;
const isActive: boolean = true;
```

### 11. Rest Parameters

```typescript
// Rest parameters
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}
```

### 12. Function Return Types

```typescript
// Function return types
function add(a: number, b: number): number {
    return a + b;
}
```


## Critique of this module:
I think this module is good for learning basic TypeScript concepts.