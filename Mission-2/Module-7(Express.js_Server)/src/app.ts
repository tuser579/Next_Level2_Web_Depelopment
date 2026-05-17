import express, { type Application, type Request, type Response } from 'express';
import { userRoute } from './modules/user/user.route.js';
import { profileRoute } from './modules/profile/profile.route.js';

const app: Application = express();

// Use middleware for parsing JSON body
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// application main route
app.get('/', (req: Request, res: Response) => {
    //   res.send('Hello World!');
    res.status(200).json({ success: true, message: "Hello World! Welcome to University Management System" });
})

// Application sub routes
app.use('/api/users', userRoute);
app.use('/api/profiles', profileRoute);

export default app;
