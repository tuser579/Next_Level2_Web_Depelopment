import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";
import { pool } from "../db/index.js";
import type { ROLES } from "../types/index.js";

const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized to access this API"
                })
            }

            const decoded = jwt.verify(
                token as string, 
                config.access_secret_key as string
            ) as JwtPayload;

            const userData = await pool.query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);

            if (userData.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized to access this API"
                })
            }

            if(roles.length > 0 && !roles.includes(userData.rows[0].role)){
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized to access this API"
                })
            }
            
            req.user = userData.rows[0];
            next();

        } catch (error) {
            next(error);
        }
    }
}

export default auth;