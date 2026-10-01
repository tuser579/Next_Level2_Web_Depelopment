export interface ICreateCommentPayload {
    content: string,
    postId: string,
}

export interface IUpdateCommentPayload {
    content: string;
}