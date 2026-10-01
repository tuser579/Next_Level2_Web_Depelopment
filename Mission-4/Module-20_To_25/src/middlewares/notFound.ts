import httpStatus from "http-status";
import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        status: false,
        message: "Route Not Found",
        error: {
            code: httpStatus.NOT_FOUND,
            description: "The requested URL does not exist."
        },
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
}