import { ILoginPayload } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { config } from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";

const loginUser = async (payload: ILoginPayload) => {

    const { email, password } = payload;

    // check user
    // const user = await prisma.user.findUnique({
    //     where: {email}
    // })

    // if (!user) {
    //     throw new Error("User not found");
    // }

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email
        }
    })

    if(user.activeStatus === "BLOCKED") {
        throw new Error("Your account has been blocked. Please contact the admin for assistance.");
    }

    // check password 
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    const { id, name, role } = user;

    const jwtPayload =  {
        id,
        name,
        email,
        role
    }

    // create access token
    // const accessToken = jwt.sign(
    //     jwtPayload,
    //     config.jwt_access_secret,
    //     { 
    //         expiresIn: config.jwt_access_expires_in
    //     } as SignOptions
    // )

    const accessToken = jwtUtils.createToken(
        jwtPayload, 
        config.jwt_access_secret as string, 
        config.jwt_access_expires_in as SignOptions
    )

    // create refresh token
    // const refreshToken = jwt.sign(
    //     jwtPayload,
    //     config.jwt_refresh_secret,
    //     { 
    //         expiresIn: config.jwt_refresh_expires_in 
    //     } as SignOptions
    // )

    const refreshToken = jwtUtils.createToken(
        jwtPayload, 
        config.jwt_refresh_secret as string, 
        config.jwt_refresh_expires_in as SignOptions
    )

    // const { password: _, ...userWithoutPassword } = user;
    return {
        // userWithoutPassword,
        accessToken,
        refreshToken
    }    
}

const refreshToken = async(token:string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret as string);

    if(!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.error);
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where: {id}
    })

    if(user.activeStatus === "BLOCKED") {
        throw new Error("Your account has been blocked. Please contact the admin for assistance.");
    }

    const { name, email, role } = user;

    const jwtPayload =  {
        id,
        name,
        email,
        role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload, 
        config.jwt_access_secret as string, 
        config.jwt_access_expires_in as SignOptions
    )

    return {
        accessToken
    }
}

export const authService = {
    loginUser,
    refreshToken
}