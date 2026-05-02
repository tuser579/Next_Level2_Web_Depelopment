// array, object, tupple

let bazarList:string[] = ['egg', 'rice', 'sugar'];
// bazarList = [1, 2, 3];
// bazarList.push(true);

let mixedArray:(string | number)[] = ["egg", 1, 2, "water"];
mixedArray.push(123);
// mixedArray.push(true);

// let coordinates: [number, number] = [20, 30, 50];
let couple: [string, string] = ["Husband", "wife"];
let destination: [string, string, number] = ["Dhaka", "Chattogram", 3];


// reference type
const user : {
    // firstName: "MD",  // value => type: Literal types
    readonly firstName: string,  // access modifier
    middleName?: string,    // ? = Optional type
    lastName: string
} = {
    firstName: "MD",
    lastName: "Tuser"
}
console.log(user)

// user.firstName = "Islam";

