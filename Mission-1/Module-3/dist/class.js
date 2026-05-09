"use strict";
// oop - class >>> object
Object.defineProperty(exports, "__esModule", { value: true });
// class Animal {
//   name: string;
//   species: string;
//   sound: string;
//   constructor(name: string, species: string, sound: string) {
//     this.name = name;
//     this.species = species;
//     this.sound = sound;
//   }
//   makeSound() {
//     console.log(`${this.name} is making  sound: ${this.sound}`);
//   }
// }
// patrameter properties - automatic properties declare and initialization
class Animal {
    name;
    species;
    sound;
    constructor(name, species, sound) {
        this.name = name;
        this.species = species;
        this.sound = sound;
    }
    makeSound() {
        console.log(`${this.name} is making  sound: ${this.sound}`);
    }
}
const toggleReadStatus = (obj) => {
    return {
        ...obj,
        isRead: true,
    };
};
const bookInfo = {
    title: "TypeScript Guide",
    author: "Jane Doe",
    publishedYear: 2024,
    isRead: true,
};
const result5 = toggleReadStatus(bookInfo);
console.log(result5);
//# sourceMappingURL=class.js.map