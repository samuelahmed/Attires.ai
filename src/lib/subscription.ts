import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userSubscription = await prismadb.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  let isSubscriptionActive = false;

  if (
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()
  ) {
    isSubscriptionActive = true;
  }

  return isSubscriptionActive;
};
