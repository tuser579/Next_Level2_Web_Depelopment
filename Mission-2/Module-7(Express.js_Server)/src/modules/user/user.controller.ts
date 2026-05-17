import type { Request, Response } from "express";
import { userService } from "./user.service.js";

const createUser = async (req: Request, res: Response) => {
    
    try {
        const result = await userService.createUserIntoDB(req.body);
        res.status(201).json(
            { 
                message: "User Created Successfully!",
                data: result.rows[0],
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: "Error creating user", error:  error?.message});
    }
} 

const getAllUsers = async(req: Request, res: Response) => {
    try {
        const result = await userService.getAllUsersFromDB();
        if(result.rows.length === 0){
            res.status(404).json({ message: "Users not found"});
            return;
        }
        res.status(200).json(
            { 
                message: "User Fetched Successfully!",
                data: result.rows,
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching users", error:  error?.message});
    }
}

const getSingleUser = async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.getSingleUserFromDB(Number(id));
        if(result.rows.length === 0){
            res.status(404).json({ message: "User not found"});
            return;
        }
        res.status(200).json(
            { 
                message: "User Fetched Successfully!",
                data: result.rows[0]
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching user", error:  error?.message});
    }
}

const updateSingleUser = async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.updateSingleUserIntoDB(Number(id), req.body);
        if(result.rows.length === 0){
            res.status(404).json({ message: "User not found"});
            return;
        }
        res.status(200).json(
            { 
                message: "User Updated Successfully!",
                data: result.rows[0]
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: "Error updating user", error:  error?.message});
    }
}

const deleteSingleUser = async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.deleteSingleUserFromDB(Number(id));
        if(result.rows.length === 0){
            res.status(404).json({ message: "User not found"});
            return;
        }
        res.status(200).json(
            { 
                message: "User Deleted Successfully!",
                data: result.rows[0]
            }
        );
    } catch (error: any) {
        res.status(500).json({ message: "Error deleting user", error:  error?.message});
    }
}

export const userController = { 
    createUser,
    getAllUsers,
    getSingleUser,
    updateSingleUser,
    deleteSingleUser
}
