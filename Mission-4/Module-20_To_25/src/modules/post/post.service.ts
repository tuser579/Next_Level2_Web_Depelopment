import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
    const user = await prisma.user.findFirstOrThrow({
        where: {
            id: userId
        },
        include: {
            subscription: true
        }

    })

    if(payload.isPremium && user.subscription?.status !== 'ACTIVE') {
        throw new Error('Please subscribe to create a premium post');
    }

    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    });

    return result;
}


const getAllPosts = async (query: IPostQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page-1) * limit;

    const sortBy = query.sortBy ? query.sortBy: "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder: "desc";

    const tags = query.tags ? JSON.parse(query.tags as string) : null;

    const tagsArray = Array.isArray(tags) ? tags : [];

    const andConditions : PostWhereInput[] = []

    if(query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }

                },
                {
                    content: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    },
                }
            ]
        })
    }

    if(query.title) {
        andConditions.push({
            title : query.title
        })
    }

    if(query.content) {
        andConditions.push({
            content : query.content
        })
    }

    if(query.authorId){
        andConditions.push({
            authorId : query.authorId
        })
    }

    if(query.isFeatured) {
        andConditions.push({
            isFeatured: Boolean(query.isFeatured)
        })
    }

    if(query.tags){
        andConditions.push({
            tags : {
                hasSome : tagsArray
            }
        })
    }

    if(query.status) {
        andConditions.push({
            status: query.status
        })
    }

    andConditions.push({
        isPremium: false
    })

    const result = await prisma.post.findMany(
        {
            // filtering / exact match without AND operator
            // where: {
            //     title: "My four Post",
            //     content: "Content of the post goes here."
            // }, 

            // filtering / exact match with AND operator
            // where: {
            //     AND : [
            //         {
            //             title: "My four Post"
            //         },
            //         {
            //             content: "Content of the post goes here."
            //         },
            //         {
            //             tags:{
            //                 equals: ["typescript", "prisma", "express"]
            //             }
            //         }
            //     ]
            // },

            // searching / partial match
            // where: {
            // title: {
            //     contains: 'fiVe',
            //     mode: "insensitive"
            // },
            // not ideal for partial match
            //     content: "Content of the post goes here."
            // },

            // searching / partial match with OR operator
            // where: {
            //     OR: [
            //         {
            //             title: {
            //                 contains: 'fiVe',
            //                 mode: "insensitive"
            //             }
            //         },
            //         {
            //             content: {
            //                 contains: "post",
            //                 mode: "insensitive"
            //             }
            //         }
            //     ]
            // },

            // combining & searching using AND & OR operator 
            
            // where: {
            //     AND: [
            //         {
            //             // searching / partial match with OR operator
            //             OR: [
            //                 {
            //                     title: {
            //                         contains: "fiVe",
            //                         mode: "insensitive"
            //                     }
            //                 },
            //                 {
            //                     content: {
            //                         contains: "post",
            //                         mode: "insensitive"
            //                     }
            //                 }
            //             ]
            //         },
            //         {
            //             status: PostStatus.PUBLISHED
            //         }
            //     ]
            // },
            
            // pagination with (limit or take) and (skip or page)
            // take: 1,
            // for first page skip is 0 
            // for second page skip is 1
            // for third page skip is 2
            // for nth page skip is n-1
            // skip: 3,
            // page = 4 , take = 1, then skip = (page - 1) * take = 3

            // dynamic searching, filtering
            // where: {
            //     AND: [
            //         query.searchTerm ? {
            //             OR: [
            //                 { title: { contains: query.searchTerm, mode: "insensitive" } },
            //                 { content: { contains: query.searchTerm, mode: "insensitive" } }
            //             ]
            //         } : {},

                    // filtering
            //         query.title ? { title: query.title } : {},
            //         query.content ? { content: query.content } : {},    
            //     ]
            // },

            where: {
                AND: andConditions
            },

            // dynamic pagination
            take: limit ?? 10,
            skip: skip ?? 0,

            // dynamic sorting in ascending or descending
            orderBy: [
                { [sortBy]: sortOrder }
                // { createdAt: "desc" },
                // { title: "asc" },
                // { content: "desc" }
            ],

            include: {
                author: {
                    omit: {
                        password: true
                    }
                },
                comments: true
            }
        }
    );

    return {
        data: result,
        meta: {
            page,
            limit,
            total: result.length,
            totalPages: Math.ceil(result.length / (limit || 1))
        }
    };
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

            const post = await tx.post.findUniqueOrThrow({
                where: {
                    id: postId,
                    isPremium: false 
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