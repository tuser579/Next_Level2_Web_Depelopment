import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: any) {
            // res.status(errorObj?.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            //     success: false,
            //     statusCode: errorObj?.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            //     message: errorObj?.message || "Internal Server Error",
            //     error: (error as Error)?.message
            // });

            next(error);
        }
    }
}