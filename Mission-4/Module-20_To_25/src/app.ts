import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comment/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";
// import { config } from "./config";

import { stripe } from "./lib/stripe";
import { premiumRoutes } from "./modules/premium/premium.route";

const app: Application = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// const endpointSecret = config.stripe_webhook_secret;

// app.post('/api/subscription/webhook', express.raw({ type: 'application/json' }), (request: Request, response: Response) => {
//     let event = request.body;
//     console.log("stripe request body", event); 
//     console.log("stripe request headers", request.headers);

//     // Only verify the event if you have an endpoint secret defined.
//     // Otherwise use the basic event deserialized with JSON.parse
//     if (endpointSecret) {
//         // Get the signature sent by Stripe
//         const signature = request.headers['stripe-signature']!;
//         try {
//             // converting event buffer to a valid object
//             event = stripe.webhooks.constructEvent(
//                 request.body,
//                 signature,
//                 endpointSecret
//             );
//         } catch (err: any) {
//             console.log(`⚠️  Webhook signature verification failed.`, err.message);
//             return response.status(400).json({ message: err.message });
//         }
//     }

//     console.log("event after try block", event);

//     // Handle the event
//     switch (event.type) {
//         case 'payment_intent.succeeded':
//             const paymentIntent = event.data.object;
//             console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//             // Then define and call a method to handle the successful payment intent.
//             // handlePaymentIntentSucceeded(paymentIntent);
//             break;
//         case 'payment_method.attached':
//             const paymentMethod = event.data.object;
//             // Then define and call a method to handle the successful attachment of a PaymentMethod.
//             // handlePaymentMethodAttached(paymentMethod);
//             break;
//         default:
//             // Unexpected event type
//             console.log(`Unhandled event type ${event.type}.`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
// });

app.use("/api/subscription/webhook", express.raw({ type: 'application/json' }));

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
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/premium", premiumRoutes);

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