import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";
import { pool } from "../db/index.js";
import type { ROLES } from "../types/index.js";

const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(roles);

            // console.log("Auth middleware");
            // console.log(req.headers.authorization);

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
            // console.log("Decoded data",decoded);

            const userData = await pool.query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);

            // console.log(userData.rows[0]);
            if (userData.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized to access this API"
                })
            }

            if(!userData.rows[0].is_active){
                return res.status(401).json({
                    success: false,
                    message: "Your account is not active"
                })
            }

            console.log("auth role", userData.rows[0].role);
            
            req.user = userData.rows[0];
            next();

        } catch (error) {
            next(error);
        }
    }
}

export default auth;