import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"
import { ICreateCommentPayload, IUpdateCommentPayload } from "./comment.interface"

const createComment = async (payload: ICreateCommentPayload, userId: string) => {
    const { content, postId } = payload;

    // Ensure the post exists before adding a comment
    await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    });

    const result = await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: userId
        }
    });

    return result;
}

const getCommentByAuthorId = async (authorId: string) => {
    const result = await prisma.comment.findMany({
        where: {
            authorId
        },
        include: {
            post: true,
            author: true
        }
    });

    return result;
}

const getCommentByPostId = async (postId: string) => {
    const result = await prisma.comment.findMany({
        where: {
            postId
        }
    });

    return result;
}

const updateComment = async (commentId: string, payload: IUpdateCommentPayload) => {
    const { content } = payload;

    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            content
        }
    });

    return result;
}

const deleteComment = async (commentId: string) => {
    await prisma.comment.delete({
        where: {
            id: commentId
        }
    });
}

const moderateComment = async (commentId: string, status: CommentStatus) => {
    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            status
        }
    });
    return result;
}

export const commentService = {
    createComment,
    getCommentByAuthorId,
    getCommentByPostId,
    updateComment,
    deleteComment,
    moderateComment
};