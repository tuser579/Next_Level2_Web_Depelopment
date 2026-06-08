import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import sendResponse from "../../utility/sendResponse.js";

const loginUser = async(req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);

        const { refreshToken } = result;

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,  // for security and why httpOnly is true? Javascript can't access this cookie, only server can access this cookie, so it's more secure 
            secure: false,  // In production, set this to true
            sameSite: "lax",
            // maxAge: 7 * 24 * 60 * 60 * 1000
        });

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User logged in successfully",
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
    loginUser,
    refreshToken
};
