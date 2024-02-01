import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs";

export const maxDuration = 100;

export async function POST(request: Request) {
  /*
  Check current user and get ID
  */
  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user) {
    console.log("Unauthorized user");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { file: s3URL } = await request.json();
    console.log("s3URL:", s3URL);
    if (!s3URL) {
      console.log("No file");
      return new NextResponse("No file");
    }

    const newEntry = await prismadb.image.create({
      data: {
        userId: userId,
        type: "Result-Dalle",
        url: s3URL.image,
      },
    });

    // Fetch the current subscription
    const currentUserUseage = await prismadb.user.findUnique({
      where: {
        externalId: userId,
      },
    });

    if (!currentUserUseage || currentUserUseage.currentPeriodUse === null) {
      console.log("Subscription not found or currentPeriodUse is null");
      return;
    }
    
    // Increment currentPeriodUse by 1
    const newCurrentPeriodUse = currentUserUseage.currentPeriodUse + 1;

    // Update the subscription
    await prismadb.user.update({
      where: {
        externalId: userId,
      },
      data: {
        currentPeriodUse: newCurrentPeriodUse,
      },
    });

    return NextResponse.json({
      s3URL,
      success: true,
    });
  } catch (error) {
    console.log("Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message });
    } else {
      return NextResponse.json({ error: "An unknown error occurred" });
    }
  }
}
