import { type Response } from "express";

type TResponse<T> = {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T | null;
    error?: any;
}

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    if(data.statusCode === 200 || data.statusCode === 201){
        res.status(data.statusCode).json({
            success: data.success,
            message: data.message,
            data: data.data || null,
        });
    }else if(data.statusCode === 404){
        res.status(data.statusCode).json({
            success: data.success,
            message: data.message,
        });
    }else{
        res.status(data.statusCode).json({
            success: data.success,
            message: data.message,
            error: data.error || null
        });
    }
}

export default sendResponse;