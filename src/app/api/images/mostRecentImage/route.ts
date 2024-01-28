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
    const newestEntry = await prismadb.image.findFirst({
      where: {
        type: "Upload",
        userId: userId
      },
      orderBy: {
        id: "desc",
      },
    });
    if (!newestEntry) {
      return NextResponse.json("Must have an image uploaded");
    }
    return NextResponse.json({
      url: newestEntry.url,
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
