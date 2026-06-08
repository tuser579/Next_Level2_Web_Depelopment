import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import sendResponse from "../../utility/sendResponse.js";

const registerUser = async(req: Request, res: Response) => {
    try {
        const result = await authService.registerUserIntoDB(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User registered successfully",
            data: result
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const loginUser = async(req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);

        const { token } = result;

        res.cookie("refresh_token", token, {
            httpOnly: true,  // for security and why httpOnly is true? Javascript can't access this cookie, only server can access this cookie, so it's more secure 
            secure: false,  // In production, set this to true
            sameSite: "lax",
            // maxAge: 7 * 24 * 60 * 60 * 1000
        });

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const refreshToken = async(req: Request, res: Response) => {
    try {
        const result = await authService.genarateFreshToken(req.cookies.refresh_token);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Access token generated successfully",
            data: result
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const authController = {
    registerUser,
    loginUser,
    refreshToken
};
