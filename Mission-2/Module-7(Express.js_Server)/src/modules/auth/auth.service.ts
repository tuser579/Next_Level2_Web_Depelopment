import bcrypt from "bcryptjs";
import { pool } from "../../db/index.js";
import type { ILoginData } from "./auth.interface.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config/index.js";

const loginUserIntoDB = async (loginData: ILoginData) => {
    const { email, password } = loginData;

    // 1. Check if user exists
    // 2. Compare the password
    // 3. Generate access token    

    const userData = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    if (userData.rows.length === 0) {
        throw new Error("User not found");
    }

    const user = userData.rows[0];

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error("Invalid password");
    }

    const jwtpayload = {
        id: user.id,        
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active   
    }

    const accessToken = jwt.sign(jwtpayload, config.access_secret_key as string, { expiresIn: config.access_token_expires_in as any });

    const refreshToken = jwt.sign(jwtpayload, config.refresh_secret_key as string, { expiresIn: config.refresh_token_expires_in as any });

    return { accessToken, refreshToken };
}   

const genarateFreshToken = async (token: string) => {
    
    if (!token) {
        throw new Error("You are not authorized to access this API");
    }

    const decoded = jwt.verify(
        token as string, 
        config.refresh_secret_key as string
    ) as JwtPayload;

    const userData = await pool.query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);

    if (userData.rows.length === 0) {
        throw new Error("User not found");
    }

    if(!userData.rows[0].is_active){
        throw new Error("Your account is not active");
    }

    const jwtpayload = {
        id: userData.rows[0].id,
        name: userData.rows[0].name,
        email: userData.rows[0].email,
        role: userData.rows[0].role,
        is_active: userData.rows[0].is_active
    }

    const accessToken = jwt.sign(jwtpayload, config.access_secret_key as string, { expiresIn: config.access_token_expires_in as any });

    return { accessToken };
} 

export const authService = {
    loginUserIntoDB,
    genarateFreshToken
};