import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs";

export const maxDuration = 100;
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  /*
  Check current user and get ID
  */
  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  /*
  Find most recent img uploaded by the current user
  Return URL to be loaded by frontend
  */
  try {

    //Instead of looking through everything just check the use field in user table.
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

    // Return the total number
    return NextResponse.json({
      count: count,
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message });
    } else {
      return NextResponse.json({ error: "An unknown error occurred" });
    }
  }
}
