import { Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const createdUser = await userService.createUserIntoDB(payload);

        res.status(httpStatus.CREATED).json({
            success: true,
            statusCode: httpStatus.CREATED,
            message: "User registered successfully",
            data: createdUser
        });
    } catch (error: any) {
        console.log(error);

        res.status(httpStatus.CONFLICT).json({
            success: false,
            statusCode: httpStatus.CONFLICT,
            message: "Failed to register because user already exist!",
            errorMessages: error?.message
        });
    }
}

export const userController = {
    createUser
}