import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/register", userController.createUser);

router.get("/me",

    // (req: Request, res: Response, next: NextFunction) => {
//     const { accessToken } = req.cookies;
//     if(!accessToken) {
//         throw new Error("You are not authorized");
//     }

//     const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret);
//     if(typeof verifiedToken === "string") {
//         throw new Error("Invalid token");
//     }

//     const { id, name, email, role } = verifiedToken;

//     const requiredRoles = [Role.ADMIN, Role.USER, Role.AUTHOR];

//     if(!requiredRoles.includes(role)) {
//         return res.status(httpStatus.FORBIDDEN).json({
//             success: false,
//             statusCode: httpStatus.FORBIDDEN,
//             message: "Forbidden! You do not have permission to access this route"
//         });
//     } 
//     req.user = {
//         id,
//         name,
//         email,
//         role
//     }
    
//     next();
// }, 

    auth(Role.ADMIN, Role.USER, Role.AUTHOR),
    userController.getMyProfile
); 

router.put("/my-profile",
    auth(Role.ADMIN, Role.USER, Role.AUTHOR),
    userController.updateMyProfile
);

export const userRoutes = router;