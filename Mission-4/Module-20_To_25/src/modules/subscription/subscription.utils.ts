import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

export const getPeriodEnd = (payload: Stripe.Subscription): Date => {
    const currentPeriodEndInMilliseconds = payload.items.data[0]?.current_period_end;
    const currentPeriodEnd = new Date(currentPeriodEndInMilliseconds as number * 1000);
    return currentPeriodEnd
}

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const userId = session.metadata?.userId as string;
    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        console.log("Weebhook : Missing values for creating checkout session");
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    const currentPeriodEnd = await getPeriodEnd(stripeSubscription);

    await prisma.subscription.upsert({
        where: {
            userId
        },
        update: {
            stripeCustomerId,
            stripeSubscriptionId,
            currentPeriodEnd,
            status: "ACTIVE"
        },
        create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
            currentPeriodEnd,
            status: "ACTIVE"
        }
    })
}

export const handleChangeSubscription = async (payload: Stripe.Subscription) => {
    const currentPeriodEnd = getPeriodEnd(payload);
    const stripeSubscriptionId = payload.id;

    const statusChecking = payload.status;

    const status = (statusChecking === 'active' || statusChecking === 'trialing') ?
        SubscriptionStatus.ACTIVE
        :
        statusChecking === 'canceled' ?
            SubscriptionStatus.CANCELLED
            :
            SubscriptionStatus.EXPIRED;

    const isSubscriptionExist = await prisma.subscription.findUnique({
        where: {
            stripeSubscriptionId
        }
    })

    if (!isSubscriptionExist) {
        console.log(`Weebhook : Subscription not found for subscription id : ${stripeSubscriptionId}`);
        return; // exit here before crashing prisma
    }

    await prisma.subscription.update({
        where: {
            stripeSubscriptionId
        },
        data: {
            status,
            currentPeriodEnd
        }
    })

}