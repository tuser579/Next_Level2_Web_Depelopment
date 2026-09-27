import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface"

const createPost = async (payload: ICreatePostPayload, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    });

    return result;
}

const getAllPosts = async () => {
    const result = await prisma.post.findMany(
        {
            include: {
                author: {
                    omit: {
                        password: true
                    }
                },
                comments: true
            },
            orderBy: {
                createdAt: "desc"
            }
        }
    );
    return result;
}

const getPostsStats = async () => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            // const totalPost = await tx.post.count();
        
            // const totalPostViewsAggregate = await tx.post.aggregate({
            //     _sum: {
            //         views: true
            //     }
            // });

            // const totalPostViewsCount = totalPostViewsAggregate._sum.views

            // const totalFeaturedPost = await tx.post.count({
            //     where: {
            //         isFeatured: true
            //     }
            // });

            // const totalPublishedPost = await tx.post.count({
            //     where: {
            //         status: PostStatus.PUBLISHED
            //     }
            // });

            // const totalDraftPost = await tx.post.count({
            //     where: {
            //         status: PostStatus.DRAFT
            //     }
            // });

            // const totalArchivedPost = await tx.post.count({
            //     where: {
            //         status: PostStatus.ARCHIVED
            //     }
            // });

            // const totalComments = await tx.comment.count();

            // const totalApprovedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.APPROVED
            //     }
            // });

            // const totalRejectedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.REJECTED
            //     }
            // });

            const [
                totalPost,
                totalPostViewsAggregate,
                totalFeaturedPost,
                totalPublishedPost,
                totalDraftPost,
                totalArchivedPost,
                totalComments,
                totalApprovedComments,
                totalRejectedComments
            ] = await Promise.all([
                await tx.post.count(),
                await tx.post.aggregate({
                    _sum: {
                        views: true
                    }
                }),
                await tx.post.count({
                    where: {
                        isFeatured: true
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.PUBLISHED
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.DRAFT
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.ARCHIVED
                    }
                }),
                await tx.comment.count(),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.APPROVED
                    }
                }),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.REJECTED
                    }
                })
            ]);

            return {
                totalPost,
                totalPostViewsCount: totalPostViewsAggregate._sum.views,
                totalFeaturedPost,
                totalPublishedPost,
                totalDraftPost,
                totalArchivedPost,
                totalComments,
                totalApprovedComments,
                totalRejectedComments
            };
        }
    );

    return transactionResult;
}

const getMyPosts = async (userId: string) => {
    const myPosts = await prisma.post.findMany({
        where: {
            authorId: userId
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true,
            _count: {
                select: {
                    comments: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return myPosts;
}

const getPostById = async (postId: string) => {

    // await prisma.post.update({


    //     where: {
    //         id: postId
    //     },
    //     data: {
    //         views: {
    //             increment: 1
    //         }
    //     }
    // });

    // const post = await prisma.post.findUniqueOrThrow({
    //     where: {
    //         id: postId
    //     },
    //     include: {
    //         author: {
    //             select: {
    //                 name: true,
    //                 email: true
    //             }
    //         },
    //         comments: {
    //             where: {
    //                 status: CommentStatus.APPROVED
    //             },
    //             orderBy: {
    //                 createdAt: "desc"
    //             }
    //         },
    //         _count: {
    //             select: {
    //                 comments: true
    //             }
    //         }
    //     }
    // });

    // return post;

    const transactionResult = await prisma.$transaction(
        async (tx) => {
            await tx.post.update({
                where: {
                    id: postId
                },
                data: {
                    views: {
                        increment: 1
                    }
                }
            });

            // fake error
            // throw new Error("Something went wrong"); 

            const post = await tx.post.findUnique({
                where: {
                    id: postId
                },
                include: {
                    author: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    comments: {
                        where: {
                            status: CommentStatus.APPROVED
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            });

            return post;
        }
    );

    return transactionResult;
}

const updatePost = async (payload: IUpdatePostPayload, postId: string, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not authorized to update this post");
    }

    const updatedPost = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload,
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    });
    return updatedPost;
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    });

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not authorized to delete this post");
    }

    await prisma.post.delete({
        where: {
            id: postId
        }
    });
}

export const postService = {
    createPost,
    getAllPosts,
    getPostsStats,
    getMyPosts,
    getPostById,
    updatePost,
    deletePost
}