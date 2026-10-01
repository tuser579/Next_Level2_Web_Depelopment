import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comment/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

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

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// app.use((req: Request, res: Response) => {
//     res.status(404).json({
//         status: false,
//         message: "Route Not Found",
//         error: {
//             code: 404,
//             description: "The requested URL does not exist."
//         },
//         path: req.originalUrl,
//         timestamp: new Date().toISOString()
//     });
// })

app.use(notFound);

// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//     res.status(500).json({
//         statusCode: 500,
//         success: false,
//         message: err.message,
//         error: err.stack
//     })
// }) 

app.use(globalErrorHandler);

export default app;