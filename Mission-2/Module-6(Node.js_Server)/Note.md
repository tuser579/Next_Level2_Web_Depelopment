# ⚡ Quick tip:         

1. Use splice() if you want to directly modify the original array.

2. Use filter() or slice() if you prefer immutability (common in functional programming or React state management).

```typescript
✅ Option 1: Using splice() (mutates the array)
let arr: number[] = [10, 20, 30, 40, 50];
let indexToRemove = 2; // remove value at index 2 (30)

arr.splice(indexToRemove, 1);

console.log(arr); // [10, 20, 40, 50]

✅ Option 2: Using filter() (creates a new array)
let arr: number[] = [10, 20, 30, 40, 50];
let indexToRemove = 2;

let newArr = arr.filter((_, i) => i !== indexToRemove);

console.log(newArr); // [10, 20, 40, 50]

✅ Option 3: Using slice() (non-mutating)
let arr: number[] = [10, 20, 30, 40, 50];
let indexToRemove = 2;

let newArr = [...arr.slice(0, indexToRemove), ...arr.slice(indexToRemove + 1)];

console.log(newArr); // [10, 20, 40, 50]

```
