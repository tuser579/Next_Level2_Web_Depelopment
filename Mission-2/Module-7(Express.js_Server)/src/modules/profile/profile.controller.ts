import type { Request, Response } from "express";
import { profileService } from "./profile.service.js";
import sendResponse from "../../utility/sendResponse.js";

const createProfile = async(req: Request, res: Response) => {
    try {
        const result = await profileService.createProfileIntoDB(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Profile Created Successfully!",
            data: result.rows[0],
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Error creating profile",
            error: error?.message,
        });
    }
}

export const profileController = { 
    createProfile 
};