import express, { type Application, type Request, type Response } from 'express';
import { authRoute } from './modules/auth/auth.route.js';
import logger from './middleware/logger.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import globalErrorHandler from './middleware/globalErrorHandler.js';
import { issueRoute } from './modules/issue/issue.route.js';
import config from './config/index.js';
import sendResponse from './utility/sendResponse.js';

const app: Application = express();

// Use middleware for parsing JSON body
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use(cookieParser());
app.use(cors({
    origin: config.origin_url
}));

// application main route
app.get('/', (req: Request, res: Response) => {
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "DevPulse - Assignment Requirements Specification"
    })
})

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use(globalErrorHandler);

export default app;