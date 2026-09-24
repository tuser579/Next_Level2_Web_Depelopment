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
            error: error.message
        };
        // console.log("Token Verified failed: ", error);
        // throw new Error(error.message);
    }
}

export const jwtUtils = {
    createToken,
    verifyToken
}