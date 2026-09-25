import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";

const app: Application = express();

app.use(cors({
    origin: "http://localhost:5000", 
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Prisma-Press Server is running",
    });
});

// for register user
app.use("/api/users", userRoutes);

// for login user
app.use("/api/auth", authRoutes)

export default app;