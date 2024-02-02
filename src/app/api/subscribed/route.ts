import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs";

export const maxDuration = 100;
export const fetchCache = "force-no-store";
export const revalidate = 0;

const DAY_IN_MS = 86_400_000;

export async function GET() {
  /*
  Check current user and get ID
  */

  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
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
      return NextResponse.json({
        isSubscriptionActive: false,
      });
    }

    let isSubscriptionActive = false;

    if (
      userSubscription.stripePriceId &&
      userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
        Date.now()
    ) {
      isSubscriptionActive = true;
    }

    return NextResponse.json({
      isSubscriptionActive,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message });
    } else {
      return NextResponse.json({ error: "An unknown error occurred" });
    }
  }
}
