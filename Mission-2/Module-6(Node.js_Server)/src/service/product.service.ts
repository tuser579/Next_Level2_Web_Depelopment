import fs from "fs";
import path from "path";
import type { IProduct } from "../types/product.type";

const filePath = path.join(process.cwd(),"./src/database/db.json");

export const readProduct = () => {
    // console.log(process.cwd());
    // console.log(filePath);

    const products = fs.readFileSync(filePath, 'utf-8');
    // return products.toString();
    
    return JSON.parse(products);
}

export const insertProduct = (newProduct: IProduct) => {
    const allProducts = readProduct();
    allProducts.push(newProduct);
    fs.writeFileSync(filePath, JSON.stringify(allProducts));

    return allProducts;
}

export const updateProduct = (updatedProducts: IProduct[]) => {
    fs.writeFileSync(filePath, JSON.stringify(updatedProducts));

    return updatedProducts;
}