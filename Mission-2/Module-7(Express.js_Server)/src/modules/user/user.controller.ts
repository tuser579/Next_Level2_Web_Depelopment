import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import sendResponse from "../../utility/sendResponse.js";

const createUser = async (req: Request, res: Response) => {
    
    try {
        const result = await userService.createUserIntoDB(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User Created Successfully!",
            data: result.rows[0],
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Error creating user",
            error: error?.message,
        });
    }
} 

const getAllUsers = async(req: Request, res: Response) => {
    console.log("Controllers:", req.user);
    try {
        const result = await userService.getAllUsersFromDB();
        if(result.rows.length === 0){
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Users not found",
            });
            return;
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User Fetched Successfully!",
            data: result.rows,
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Error fetching users",
            error: error?.message,
        });
    }
}

const getSingleUser = async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.getSingleUserFromDB(Number(id));
        if(result.rows.length === 0){
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found",
            });
            return;
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User Fetched Successfully!",
            data: result.rows[0]
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Error fetching user",
            error: error?.message,
        });
    }
}

const updateSingleUser = async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.updateSingleUserIntoDB(Number(id), req.body);
        if(result.rows.length === 0){
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found",
            });
            return;
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User Updated Successfully!",
            data: result.rows[0]
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Error updating user",
            error: error?.message,
        });
    }
}

const deleteSingleUser = async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.deleteSingleUserFromDB(Number(id));
        if(result.rows.length === 0){
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found",
            });
            return;
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User Deleted Successfully!",
            data: result.rows[0]
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Error deleting user",
            error: error?.message,
        });
    }           
}

export const userController = { 
    createUser,
    getAllUsers,
    getSingleUser,
    updateSingleUser,
    deleteSingleUser
}
