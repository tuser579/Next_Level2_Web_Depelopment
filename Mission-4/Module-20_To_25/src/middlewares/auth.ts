import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { config } from "../config";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { prisma } from "../lib/prisma";


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role: Role;
            }
        }
    }
}

// auth(Role.ADMIN, Role.USER, Role.AUTHOR)
export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {

        const token = req.cookies.accessToken ?
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization?.split(" ")[1]
                :
                req.headers.authorization;

        if (!token) {
            throw new Error("You are not logged in. Please log in to access this resource");
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
        if(!verifiedToken.success) {
            throw new Error(verifiedToken.error);
        }

        const { id, name, email, role } = verifiedToken.data as JwtPayload;

        if(requiredRoles.length && !requiredRoles.includes(role)) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                statusCode: httpStatus.FORBIDDEN,
                message: "Forbidden! You do not have permission to access this route"
            });
        } 

        const user = await prisma.user.findUnique({
            where: {
                id,
                name,
                email,
                role
            },
            omit: {
                password: true,
            }
        })

        if (!user) {
            throw new Error("User not found. Please log in again.");
        }

        if(user.activeStatus === "BLOCKED") {
            throw new Error("User is blocked. Please contact the admin for assistance.");
        }

        req.user = {
            id,
            name,
            email,
            role
        }
        
        next();
    });
};
