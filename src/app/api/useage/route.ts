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
    //find all images with type: "Result-Dalle" and user Id
    //count number of them
    //return the total number
    const images = await prismadb.image.findMany({
      where: {
        type: "Result-Dalle",
        userId: userId,
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
