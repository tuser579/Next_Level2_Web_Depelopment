import type { Request, Response } from "express";
import { profileService } from "./profile.service.js";

const createProfile = async(req: Request, res: Response) => {
    try {
        const result = await profileService.createProfileIntoDB(req.body);
        res.status(201).json(
            { 
                message: "Profile Created Successfully!",
                data: result.rows[0],
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: "Error creating profile", error:  error?.message});
    }
}

export const profileController = { 
    createProfile 
};