import Stripe from "stripe";
import { config } from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { handleChangeSubscription, handleCheckoutCompleted } from "./subscription.utils";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

const createCheckoutSession = async (userId: string) => {
    const transactionResult = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                subscription: true
            }
        })

        let stripeCustomerId = user.subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id
                }
            })

            stripeCustomerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: config.stripe_product_price_id,
                    quantity: 1
                }
            ],
            mode: "subscription",
            customer: stripeCustomerId,
            // payment_method_types has been replaced by allowed_payment_method_types or can be omitted to use Stripe Dashboard settings
            allowed_payment_method_types: ["card"],
            success_url: `${config.app_url}/primium?success=true`,
            cancel_url: `${config.app_url}/primium?success=false`,
            metadata: { userId: user.id }
        })

        return session.url;
    })

    return {
        paymentUrl: transactionResult
    };
}

const handleWebhook = async (payload: Buffer, signature: string) => {
    const endpointSecret = config.stripe_webhook_secret;
    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
    );

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            // console.log("event", event.data.object);
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);

            break;
        case 'customer.subscription.updated':
            await handleChangeSubscription(event.data.object as Stripe.Subscription)

            break;
        case 'customer.subscription.deleted':
            await handleChangeSubscription(event.data.object as Stripe.Subscription);

            break;
        default:
            // Unexpected event type
            console.log(`No events matched. Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return;
}

const getSubscriptionStatus = async (userId: string) => {
    const isSubscriptionExist = await prisma.subscription.findUniqueOrThrow({
        where: {
            userId
        }
    });

    const { status, currentPeriodEnd } = isSubscriptionExist;

    const isActive = status === SubscriptionStatus.ACTIVE && new Date(currentPeriodEnd) > new Date();

    return {
        status,
        currentPeriodEnd,
        isActive
    }
}

const cancelSubscription = async (userId: string) => {
    const subscription = await prisma.subscription.findUniqueOrThrow({
        where: {
            userId
        }
    });

    const { stripeSubscriptionId } = subscription;

    if (!stripeSubscriptionId) {
        throw new Error("No subscription found for the user");
    }

    const canceledSubscription = await stripe.subscriptions.cancel(stripeSubscriptionId);

    return canceledSubscription;
}

export const subscriptionServices = {
    createCheckoutSession,
    handleWebhook,
    getSubscriptionStatus,
    cancelSubscription
}