import type { IncomingMessage, ServerResponse } from "http";
import { readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";

export const productController = (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url;
    const method = req.method;

    const urlParts = url?.split("/");
    // console.log(urlParts);
    const id = urlParts && urlParts[1] === 'products' ? Number(urlParts[2]) : null;
    console.log(id);

    // Get all products
    if(url === '/products' && method === 'GET') {
        // const products = [
        //     { id: 1, name: "Product 1", price: 100 },
        //     { id: 2, name: "Product 2", price: 200 },
        //     { id: 3, name: "Product 3", price: 300 }
        // ];

        const products = readProduct();

        res.writeHead(200,{ "Content-Type": "application/json"});
        res.end(
            JSON.stringify({
                message: "This is products route from product controller.", 
                data: {products},
            })
        );
    } 
    // Get single product
    else if(method === 'GET' && id != null) {
        const products = readProduct();
        const singleProduct = products.find((product: IProduct) => product.id === id);

        res.writeHead(200,{ "Content-Type": "application/json"});
        res.end(
            JSON.stringify({
                message: `This is product of ${id}.`,
                data: {singleProduct},
            })
        );
    }
}



