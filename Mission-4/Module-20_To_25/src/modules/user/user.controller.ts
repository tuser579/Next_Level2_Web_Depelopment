import {  Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";


// const createUser = async (req: Request, res: Response) => {
//     try {
//         const payload = req.body;
//         const createdUser = await userService.createUserIntoDB(payload);

//         res.status(httpStatus.CREATED).json({
//             success: true,
//             statusCode: httpStatus.CREATED,
//             message: "User registered successfully",
//             data: createdUser
//         });
//     } catch (error: any) {
//         console.log(error);

//         res.status(httpStatus.CONFLICT).json({
//             success: false,
//             statusCode: httpStatus.CONFLICT,
//             message: "Failed to register because user already exist!",
//             errorMessages: error?.message
//         });
//     }
// }

const createUser = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    const createdUser = await userService.createUserIntoDB(payload);

    // res.status(httpStatus.CREATED).json({ 
    //     success: true,
    //     statusCode: httpStatus.CREATED,
    //     message: "User registered successfully",
    //     data: createdUser
    // });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: createdUser
    });

}, { 
    statusCode: httpStatus.CONFLICT, 
    message: 'Failed to register because user already exist!' 
});

const getMyProfile = catchAsync( async (req: Request, res: Response ) => {
    // const { accessToken } = req.cookies;
    // console.log(req.user);

    // const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret);
    // if(typeof verifiedToken === "string") {
    //     throw new Error(verifiedToken);
    // }
    
    const userData = await userService.getMyProfileFromDB(req.user?.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile fetched successfully",
        data: userData 
    });    
})

const updateMyProfile = catchAsync( async (req: Request, res: Response ) => {
    const { id } = req.user as {id: string};
    const payload = req.body;
    const updateData = await userService.updateMyProfileFromDB(id, payload);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile updated successfully",
        data: updateData
    })
})

export const userController = { 
    createUser,
    getMyProfile,
    updateMyProfile
} 