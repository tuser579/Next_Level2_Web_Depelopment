// function
// arrow function , normal function

function add(num1: number,num2: number): number {
    return num1 + num2;
}

const add2 = (num1: number, num2: number): number => (num1 + num2)

// add(2,'2');

// object => function

const poorUser = {
    name: 'Tuser',
    balance: 0,
    addBalance(value: number) {
        return this.balance + value;
    }
}

const arr: number[] = [1,2,3];

const sqrArray = arr.map((x: number): number => x*x);