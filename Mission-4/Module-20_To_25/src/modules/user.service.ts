import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { ICreateUserPayload } from "./user.interface";

const createUserIntoDB = async (payload:ICreateUserPayload) => {

    // destructuring payload
    const {name, email, password, profilePhoto} = payload;

    // check user is exists
    const isUserExist = await prisma.user.findUnique({where: {email}});

    // throw error if user is exists
    if (isUserExist) {
        throw new Error("User already exists");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    // create user
    const createdUser = await prisma.user.create({
        data:{
            name,
            email,
            password: hashedPassword,
            profile: {
                create: {
                    profilePhoto
                }
            }
        }
    })

    // create profile
    // await prisma.profile.create({
    //     data:{
    //         userId: createdUser.id,
    //         profilePhoto
    //     }
    // })

    // get user without password
    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email 
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })
}

export const userService = {
    createUserIntoDB
}