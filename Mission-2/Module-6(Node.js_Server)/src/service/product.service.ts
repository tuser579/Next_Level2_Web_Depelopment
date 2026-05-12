import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(),"./src/database/db.json");

export const readProduct = () => {
    // console.log(process.cwd());
    // console.log(filePath);

    const products = fs.readFileSync(filePath, 'utf-8');
    // return products.toString();
    
    return JSON.parse(products);
}
