import express, { type Application, type Request, type Response } from 'express';
import { userRoute } from './modules/user/user.route.js';
import { profileRoute } from './modules/profile/profile.route.js';
import { authRoute } from './modules/auth/auth.route.js';
import logger from './middleware/logger.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import globalErrorHandler from './middleware/globalErrorHandler.js';

const app: Application = express();

// Use middleware for parsing JSON body
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5000"
}));

// application main route
app.get('/', (req: Request, res: Response) => {
    //   res.send('Hello World!');
    res.status(200).json({ success: true, message: "Hello World! Welcome to University Management System" });
})

// Application sub routes
app.use('/api/users', userRoute);
app.use('/api/profiles', profileRoute);

app.use("/api/auth", authRoute);

app.use(globalErrorHandler);

export default app;
