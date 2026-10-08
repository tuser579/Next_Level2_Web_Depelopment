import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { subscriptionServices } from "./subscription.service";
import httpStatus from "http-status";
import { Request, Response } from "express";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    
    const userId = req.user?.id;
    const result = await subscriptionServices.createCheckoutSession(userId as string);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result
    })
})

const handleWebhook = catchAsync(
    async(req: Request, res: Response)=>{

    const event = req.body as Buffer;
    const signature = req.headers['stripe-signature']!;

    // call service method
    await subscriptionServices.handleWebhook(event, signature as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Webhook handled successfully",
        data: null
    })
})

const getSubscriptionStatus = catchAsync(async(req: Request, res: Response)=>{
    const userId = req.user?.id;
    const result = await subscriptionServices.getSubscriptionStatus(userId as string);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription status fetched successfully",
        data: result
    })
})

const cancelSubscription = catchAsync(async(req: Request, res: Response)=>{
    const userId = req.user?.id;
    const result = await subscriptionServices.cancelSubscription(userId as string);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Subscription cancelled successfully",
        data: result
    })
})

export const subscriptionController = {
    createCheckoutSession,
    handleWebhook,
    getSubscriptionStatus,
    cancelSubscription
}