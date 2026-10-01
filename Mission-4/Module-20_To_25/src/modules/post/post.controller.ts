import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";  
import { postService } from "./post.service";
import httpStatus from "http-status";

const createPost = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const id = req.user?.id;

    const result = await postService.createPost(payload, id as string);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Post created successfully",
        data: result
    });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const posts = await postService.getAllPosts(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Posts fetched successfully",
        data: posts
    });
});

const getPostsStats = catchAsync(async (req: Request, res: Response) => {
    const result = await postService.getPostsStats();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Posts stats fetched successfully",
        data: result
    }); 
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id; 

    const result = await postService.getMyPosts(userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My posts fetched successfully",
        data: result
    });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
   const postId = req.params?.postId;

   if(!postId) {
    throw new Error("Post ID is required"); 
   }

   const result = await postService.getPostById(postId as string);

   sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post fetched successfully",
        data: result
    });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const postId = req.params?.postId;
    const payload = req.body;

    if(!postId) {
        throw new Error("Post ID is required");
    }

    const result = await postService.updatePost(payload, postId as string, authorId as string, isAdmin as boolean);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post updated successfully",
        data: result
    });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const postId = req.params?.postId;

    if(!postId) {
        throw new Error("Post ID is required");
    }

    await postService.deletePost(postId as string, authorId as string, isAdmin as boolean);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post deleted successfully",
        data: null
    });
});

export const postController = {
    createPost,
    getAllPosts,
    getPostsStats,
    getMyPosts,
    getPostById,
    updatePost,
    deletePost
}