import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
    payload: JwtPayload, 
    secret: string, 
    expiresIn: SignOptions
) => {
    const token = jwt.sign(
        payload, 
        secret, 
        {
            expiresIn: expiresIn as SignOptions["expiresIn"]
        } 
    );
    return token;
}

const verifyToken = (token: string, secret: string) => {
    try {
        const verifiedToken = jwt.verify(token, secret);
        return {
            success: true,
            data: verifiedToken
        };
    } catch(error: any) {
        return {
            success: false,
            // error: error.message,   // message string (for display if needed)
            originalError: error    // ✅ keep the original error object (preserves .name, .stack)
        };
    }
}

export const jwtUtils = {
    createToken,
    verifyToken
}