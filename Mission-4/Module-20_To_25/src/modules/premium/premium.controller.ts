import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import { premiumServices } from "./premium.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getPremiumContent = catchAsync(async(req: Request, res: Response)=>{

    const result = await premiumServices.getPremiumContent();
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Premium content fetched successfully",
        data: result
    })
})

export const premiumController = {
    getPremiumContent
}
    
