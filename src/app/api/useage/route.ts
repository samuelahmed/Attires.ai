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

  try {
    const user = await prismadb.user.findFirst({
      where: {
        externalId: userId,
      },
    });

    let currentPeriodUse = 0;
    if (user) {
      currentPeriodUse = user.currentPeriodUse;
    } else {
    }

    return NextResponse.json({
      currentPeriodUse: currentPeriodUse,
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
