import type { IncomingMessage, ServerResponse } from "http";
import { insertProduct, readProduct, updateProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";
import { sendResponse } from "../utility/sendResponse";

export const productController = async (
    req: IncomingMessage, 
    res: ServerResponse
) => {
    const url = req.url;
    const method = req.method;

    const urlParts = url?.split("/");
    // console.log(urlParts);
    const id = urlParts && urlParts[1] === 'products' ? Number(urlParts[2]) : null;
    // console.log(id);

    // Get all products
    if(url === '/products' && method === 'GET') {
        try {
            const products = readProduct();
            return sendResponse(res, 200, true, "Product fetched successfully", { products });
        } catch (error) {
            return sendResponse(res, 500, false, "Failed to fetch products!", error);
        }
    } 
    // Get single product
    else if(method === 'GET' && id != null) {
        try {
            const products = readProduct();
            const singleProduct = products.find((product: IProduct) => product.id === id);
            if(!singleProduct) {
                return sendResponse(res, 404, false, "Product not found!", null);
            }
            return sendResponse(res, 200, true, "Product fetched successfully", { singleProduct });
        } catch (error) {
            return sendResponse(res, 500, false, "Failed to fetch product!", error);
        }
    }
    else if(method === 'POST' && url === '/products') {
        const body = await parseBody(req);
        // console.log(body);

        try {
            const newProduct = { id: readProduct().length + 1, ...body };
            insertProduct(newProduct);
            const products = readProduct();
            return sendResponse(res, 200, true, "Product created successfully", { products });
        } catch (error) {
            return sendResponse(res, 500, false, "Failed to create product!", error);
        }
    }
    else if(method === 'PUT' && id !== null) {
        const body = await parseBody(req);
        const products = readProduct();

        try {
            const index = products.findIndex((product: IProduct) => product.id === id);

            if(index === -1) {
                return sendResponse(res, 404, false, "Product not found!", null);
            }
            const updateProducts = products.map((product: IProduct) => {
                if(product.id === id) {
                    // return {...product, ...body};
                    return {
                        id,
                        ...body
                    }
                }
                return product;
            });

            updateProduct(updateProducts);
            return sendResponse(res, 200, true, "Product updated successfully", { updateProducts });
        } catch (error) {
            return sendResponse(res, 500, false, "Failed to update product!", error);
        }
    }
    else if(method === 'DELETE' && id !== null) {
        try {
            const products = readProduct();

            // const deletedAfterProducts = products.filter((product: IProduct) => product.id !== id);

            const index = products.findIndex((product: IProduct) => product.id === id);
            if(index === -1) {
                return sendResponse(res, 404, false, "Product not found!", null);           
            }

            products.splice(index, 1);
            updateProduct(products);

        return sendResponse(res, 200, true, "Product deleted successfully", { products });  
        } catch (error) {
            return sendResponse(res, 500, false, "Failed to delete product!", error);
        }
    }
}