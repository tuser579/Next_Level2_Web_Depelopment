import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { commentService } from "./comment.service";
import httpStatus from "http-status";
import { CommentStatus } from "../../../generated/prisma/enums";

const createComment = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const payload = req.body;

    const result = await commentService.createComment(payload, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Comment created successfully",
        data: result
    })
});

const getCommentByAuthorId = catchAsync(async (req: Request, res: Response) => {
    const authorId = req.params?.authorId;

    const result = await commentService.getCommentByAuthorId(authorId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comments retrieved successfully",
        data: result
    });

});

const getCommentByPostId = catchAsync(async (req: Request, res: Response) => {
    const postId = req.params?.postId;

    const result = await commentService.getCommentByPostId(postId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comment retrieved successfully",
        data: result
    });

});

const updateComment = catchAsync(async (req: Request, res: Response) => {
    const commentId = req.params?.commentId;
    const payload = req.body;

    const result = await commentService.updateComment(commentId as string, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comment updated successfully",
        data: result
    });

});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
    const commentId = req.params?.commentId;

    await commentService.deleteComment(commentId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comment deleted successfully",
        data: null
    });

});

const moderateComment = catchAsync(async (req: Request, res: Response) => {
    const commentId = req.params?.commentId;
    const status = req.body.status;
    
    const result = await commentService.moderateComment(commentId as string, status as CommentStatus);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comment moderated successfully",
        data: result
    });

});

export const commentController = {
    createComment,
    getCommentByAuthorId,
    getCommentByPostId,
    updateComment,
    deleteComment,
    moderateComment
};