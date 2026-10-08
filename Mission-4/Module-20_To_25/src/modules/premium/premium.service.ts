import { prisma } from "../../lib/prisma"

const getPremiumContent = async()=>{
    const posts = await prisma.post.findMany({
        where:{
            isPremium: true
        },
        include:{
            author: true
        }
    })

    return posts;
}

export const premiumServices = {
    getPremiumContent
} 