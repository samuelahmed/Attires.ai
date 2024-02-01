import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";


export const checkUseage = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const subscription = await prismadb.subscription.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found for the user");
  }

  // console.log(subscription.stripeCurrentPeriodEnd);
  if (!subscription.stripeCurrentPeriodEnd) {
    throw new Error("Subscription period end date not found for the user");
  }

  const periodStart = new Date(subscription.stripeCurrentPeriodEnd);
  periodStart.setDate(periodStart.getDate() - 30);

  const images = await prismadb.image.findMany({
    where: {
      type: "Result-Dalle",
      userId: userId,
      createdAt: {
        gte: periodStart,
        lte: subscription.stripeCurrentPeriodEnd,
      },
    },
  });

  // Count number of them
  const count = images.length;
  return count
};
