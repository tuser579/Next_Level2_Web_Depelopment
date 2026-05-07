type User = {
  name: string;
  age: number;
};

type Role = {
  role: "admin" | "user";
};

type UserWithRole = User & Role;

const user1: UserWithRole = {
  name: "Mr.X",
  age: 100,
  role: "admin",
};

// interface : object type: array, object , function
interface IUser {
  name: string;
  age: number;
}

const user2: IUser = {
  name: "Mr. Y",
  age: 102,
};

interface IUserWithRole extends IUser {
  role: "admin" | "user";
}

const user3: IUserWithRole = {
  name: "Mr. Y",
  age: 102,
  role: "admin",
};

// function

type Add = (num1: number, num2: number) => number;

const add: Add = (num1, num2) => num1 + num2;

// console.log(add(10, 20));
interface IAdd {
  (num1: number, num2: number): number;
}

const add2: IAdd = (num1, num2) => num1 + num2;
console.log(add2(10, 20));

interface IResult {
  (array: number[]): number;
}

const result: IResult = (array) => {
  return array.reduce((acc, curr) => acc + curr, 0);
};

interface ICollegeFrinend {
  (array: string[]): string;
}

const collegeFrinend: ICollegeFrinend = (array) => {
  return array.reduce((acc, curr) => acc + curr, "");
};

// array
type Friends = string[];

interface IFriends {
  [index: number]: string;
}

const friendss: Friends = ["Mr.A", "Mr.B", "Mr.C"];
const friends: IFriends = ["Mr.A", "Mr.B", "Mr.C"];
