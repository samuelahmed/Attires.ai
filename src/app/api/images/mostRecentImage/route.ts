import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs";

export const maxDuration = 100;
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(req: Request, res: Response) {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const newestEntry = await prismadb.image.findFirst({
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
